// OVD Service - Business logic for OVD operations
import pool from '../config/database';
import { DNVAdapter } from './dnv.adapter';
import fs from 'fs';
import path from 'path';
import { logAuditEvent } from '../utils/audit-logger';

export interface ImportResult {
  success: boolean;
  recordsProcessed: number;
  recordsImported: number;
  recordsFailed: number;
  errors: string[];
  syncHistoryId?: string;
  fileMetadataId?: string;
}

export interface ExportResult {
  success: boolean;
  fileName: string;
  filePath: string;
  recordCount: number;
  fileSize: number;
  fileMetadataId?: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export class OVDService {
  /**
   * Import OVD file and process fuel consumption data
   */
  static async importOVDFile(
    userId: string,
    voyageId: string | null,
    filePath: string,
    fileName: string,
    shipId: string | null = null
  ): Promise<ImportResult> {
    const client = await pool.connect();
    let syncHistoryId: string | undefined;
    let fileMetadataId: string | undefined;
    
    try {
      await client.query('BEGIN');
      
      // Parse the Excel file
      const { records, metadata } = DNVAdapter.parseOVDExcelFile(filePath);
      
      // Validate the data
      const validation = DNVAdapter.validateOVD310Format(records);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Get file size
      const fileStats = fs.statSync(filePath);
      
      // Create file metadata record
      const fileMetadataResult = await client.query(
        `INSERT INTO ovd_file_metadata (
          file_name, file_path, file_size_bytes, file_type, operation_type,
          uploaded_by, voyage_id, ship_id, imo_number, record_count,
          date_range_start, date_range_end, processing_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id`,
        [
          fileName,
          filePath,
          fileStats.size,
          path.extname(fileName).replace('.', ''),
          'IMPORT',
          userId,
          voyageId,
          shipId,
          metadata.vessels[0] || null,
          metadata.recordCount,
          metadata.dateRange.start,
          metadata.dateRange.end,
          'PROCESSING'
        ]
      );
      
      fileMetadataId = fileMetadataResult.rows[0].id;
      
      // Create sync history record
      const syncHistoryResult = await client.query(
        `INSERT INTO ovd_sync_history (
          sync_type, operation, direction, initiated_by,
          file_metadata_id, status, records_processed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
        ['MANUAL', 'IMPORT', 'FROM_OVD', userId, fileMetadataId, 'IN_PROGRESS', records.length]
      );
      
      syncHistoryId = syncHistoryResult.rows[0].id;
      
      let recordsImported = 0;
      let recordsFailed = 0;
      const errors: string[] = [];
      
      // Process each record
      for (const record of records) {
        try {
          // Map to fuel consumption entries
          const fuelEntries = DNVAdapter.mapToFuelConsumption(record, voyageId || '');
          
          // Insert fuel consumption records
          for (const entry of fuelEntries) {
            await client.query(
              `INSERT INTO fuel_consumption (
                voyage_id, fuel_type, fuel_category, consumption_tonnes,
                consumption_date, engine_type, fuel_supplier, bunker_delivery_note,
                energy_source_type, energy_consumption_kwh
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
              [
                entry.voyage_id,
                entry.fuel_type,
                entry.fuel_category,
                entry.consumption_tonnes,
                entry.consumption_date,
                entry.engine_type,
                entry.fuel_supplier,
                entry.bunker_delivery_note,
                entry.energy_source_type,
                entry.energy_consumption_kwh
              ]
            );
          }
          
          recordsImported++;
        } catch (error: any) {
          recordsFailed++;
          errors.push(`Row ${recordsImported + recordsFailed}: ${error.message}`);
          
          // Log validation error
          await client.query(
            `INSERT INTO ovd_import_validation_errors (
              sync_history_id, file_metadata_id, row_number,
              error_type, error_message, severity
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [syncHistoryId, fileMetadataId, recordsImported + recordsFailed, 'VALIDATION_FAILED', error.message, 'ERROR']
          );
        }
      }
      
      // Update sync history
      await client.query(
        `UPDATE ovd_sync_history SET
          status = $1, records_imported = $2, records_failed = $3,
          completed_at = NOW(), error_log = $4
        WHERE id = $5`,
        [
          recordsFailed > 0 ? 'PARTIAL_SUCCESS' : 'SUCCESS',
          recordsImported,
          recordsFailed,
          errors.length > 0 ? errors.join('\n') : null,
          syncHistoryId
        ]
      );
      
      // Update file metadata
      await client.query(
        `UPDATE ovd_file_metadata SET
          processing_status = $1, error_message = $2
        WHERE id = $3`,
        [recordsFailed === 0 ? 'COMPLETED' : 'FAILED', errors.length > 0 ? errors.join('\n') : null, fileMetadataId]
      );
      
      await client.query('COMMIT');
      
      // Log audit event
      await logAuditEvent({
        userId,
        actionType: 'IMPORT_FILE',
        entityType: 'FILE',
        entityId: fileMetadataId,
        result: recordsFailed === 0 ? 'SUCCESS' : 'PARTIAL',
        metadata: { recordsImported, recordsFailed, fileName }
      });
      
      return {
        success: recordsFailed < records.length,
        recordsProcessed: records.length,
        recordsImported,
        recordsFailed,
        errors,
        syncHistoryId,
        fileMetadataId
      };
    } catch (error: any) {
      await client.query('ROLLBACK');
      
      // Log audit event for failure
      await logAuditEvent({
        userId,
        actionType: 'IMPORT_FILE',
        entityType: 'FILE',
        entityId: fileMetadataId,
        result: 'FAILED',
        errorMessage: error.message,
        metadata: { fileName }
      });
      
      throw error;
    } finally {
      client.release();
      
      // Clean up uploaded file after processing
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
  
  /**
   * Export fuel consumption data as OVD Excel file
   */
  static async exportOVDFile(
    userId: string,
    voyageId: string | null,
    dateRange: DateRange,
    shipId?: string
  ): Promise<ExportResult> {
    const client = await pool.connect();
    let fileMetadataId: string | undefined;
    
    try {
      // Build query to fetch fuel consumption data
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;
      
      if (voyageId) {
        whereClause += ` AND fc.voyage_id = $${paramCount}`;
        params.push(voyageId);
        paramCount++;
      }
      
      if (shipId) {
        whereClause += ` AND v.ship_id = $${paramCount}`;
        params.push(shipId);
        paramCount++;
      }
      
      if (dateRange.startDate) {
        whereClause += ` AND fc.consumption_date >= $${paramCount}`;
        params.push(dateRange.startDate);
        paramCount++;
      }
      
      if (dateRange.endDate) {
        whereClause += ` AND fc.consumption_date <= $${paramCount}`;
        params.push(dateRange.endDate);
        paramCount++;
      }
      
      const query = `
        SELECT 
          fc.*,
          v.voyage_id as voyage_number,
          s.imo_number,
          s.name as ship_name
        FROM fuel_consumption fc
        LEFT JOIN voyages v ON fc.voyage_id = v.id
        LEFT JOIN ships s ON v.ship_id = s.id
        ${whereClause}
        ORDER BY fc.consumption_date ASC
      `;
      
      const result = await client.query(query, params);
      const fuelData = result.rows;
      
      if (fuelData.length === 0) {
        throw new Error('No data found for the specified criteria');
      }
      
      // Generate Excel file
      const buffer = DNVAdapter.generateOVDExcelFile(fuelData);
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const imoNumber = fuelData[0].imo_number || 'UNKNOWN';
      const fileName = `OVD_3.10.1_${imoNumber}_${dateRange.startDate}_${dateRange.endDate}_${timestamp}.xlsx`;
      const filePath = path.join('/tmp/ovd-exports', fileName);
      
      // Ensure export directory exists
      const exportDir = '/tmp/ovd-exports';
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }
      
      // Write file to disk
      fs.writeFileSync(filePath, buffer);
      
      // Create file metadata record
      const fileMetadataResult = await client.query(
        `INSERT INTO ovd_file_metadata (
          file_name, file_path, file_size_bytes, file_type, operation_type,
          uploaded_by, voyage_id, imo_number, record_count,
          date_range_start, date_range_end, processing_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id`,
        [
          fileName,
          filePath,
          buffer.length,
          'xlsx',
          'EXPORT',
          userId,
          voyageId,
          imoNumber,
          fuelData.length,
          dateRange.startDate,
          dateRange.endDate,
          'COMPLETED'
        ]
      );
      
      fileMetadataId = fileMetadataResult.rows[0].id;
      
      // Create sync history record
      await client.query(
        `INSERT INTO ovd_sync_history (
          sync_type, operation, direction, initiated_by,
          file_metadata_id, status, records_exported, completed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        ['MANUAL', 'EXPORT', 'TO_OVD', userId, fileMetadataId, 'SUCCESS', fuelData.length]
      );
      
      // Log audit event
      await logAuditEvent({
        userId,
        actionType: 'EXPORT_FILE',
        entityType: 'FILE',
        entityId: fileMetadataId,
        result: 'SUCCESS',
        metadata: { recordCount: fuelData.length, fileName, dateRange }
      });
      
      return {
        success: true,
        fileName,
        filePath,
        recordCount: fuelData.length,
        fileSize: buffer.length,
        fileMetadataId
      };
    } catch (error: any) {
      // Log audit event for failure
      await logAuditEvent({
        userId,
        actionType: 'EXPORT_FILE',
        entityType: 'FILE',
        entityId: fileMetadataId,
        result: 'FAILED',
        errorMessage: error.message,
        metadata: { voyageId, dateRange }
      });
      
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Get sync status
   */
  static async getSyncStatus(limit: number = 10): Promise<any[]> {
    const query = `
      SELECT 
        sh.id, sh.sync_type, sh.operation, sh.status,
        sh.records_processed, sh.records_imported, sh.records_exported,
        sh.initiated_at, sh.completed_at,
        fm.file_name, fm.imo_number
      FROM ovd_sync_history sh
      LEFT JOIN ovd_file_metadata fm ON sh.file_metadata_id = fm.id
      ORDER BY sh.initiated_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
  
  /**
   * Get sync configuration
   */
  static async getSyncConfig(organizationId?: string): Promise<any[]> {
    let query = `
      SELECT * FROM ovd_sync_config
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (organizationId) {
      query += ' AND organization_id = $1';
      params.push(organizationId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }
}

