// OVD Controller - HTTP endpoints for OVD operations
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { OVDService } from '../services/ovd.service';
import { syncScheduler } from '../services/sync.scheduler';
import pool from '../config/database';
import { logAuditEvent, createAuditEntry } from '../utils/audit-logger';
import fs from 'fs';

export class OVDController {
  /**
   * POST /api/voyages/ovd/import
   * Upload and import OVD Excel file
   */
  async importOVDFile(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'No file uploaded',
          traceId: req.headers['x-trace-id']
        });
      }
      
      const { voyageId, shipId } = req.body;
      const userId = req.user?.id || 'unknown';
      
      // Import the file
      const result = await OVDService.importOVDFile(
        userId,
        voyageId || null,
        req.file.path,
        req.file.originalname,
        shipId || null
      );
      
      res.status(200).json({
        code: 'SUCCESS',
        message: 'OVD file imported successfully',
        data: result,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error importing OVD file:', error);
      
      // Log audit event
      await logAuditEvent(createAuditEntry(
        req,
        'IMPORT_FILE',
        'FAILED',
        { errorMessage: error.message }
      ));
      
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to import OVD file',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  /**
   * GET /api/voyages/ovd/export
   * Export fuel consumption data as OVD Excel file
   */
  async exportOVDFile(req: AuthRequest, res: Response) {
    try {
      const { voyageId, startDate, endDate, shipId } = req.query;
      const userId = req.user?.id || 'unknown';
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'startDate and endDate are required',
          traceId: req.headers['x-trace-id']
        });
      }
      
      // Export the data
      const result = await OVDService.exportOVDFile(
        userId,
        voyageId as string || null,
        {
          startDate: startDate as string,
          endDate: endDate as string
        },
        shipId as string
      );
      
      // Send file as download
      res.download(result.filePath, result.fileName, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        
        // Clean up file after sending
        if (fs.existsSync(result.filePath)) {
          fs.unlinkSync(result.filePath);
        }
      });
    } catch (error: any) {
      console.error('Error exporting OVD file:', error);
      
      // Log audit event
      await logAuditEvent(createAuditEntry(
        req,
        'EXPORT_FILE',
        'FAILED',
        { errorMessage: error.message }
      ));
      
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to export OVD file',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  /**
   * POST /api/voyages/ovd/sync
   * Trigger manual sync operation
   */
  async triggerManualSync(req: AuthRequest, res: Response) {
    try {
      const { direction, voyageId, dateRange } = req.body;
      const userId = req.user?.id || 'unknown';
      
      if (!direction || !['IMPORT', 'EXPORT', 'BIDIRECTIONAL'].includes(direction)) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid sync direction. Must be IMPORT, EXPORT, or BIDIRECTIONAL',
          traceId: req.headers['x-trace-id']
        });
      }
      
      // Log audit event
      await logAuditEvent(createAuditEntry(
        req,
        'TRIGGER_MANUAL_SYNC',
        'SUCCESS',
        { 
          entityType: 'SYNC_OPERATION',
          metadata: { direction, voyageId, dateRange }
        }
      ));
      
      // For BIDIRECTIONAL or EXPORT, execute export
      let exportResult = null;
      if (direction === 'EXPORT' || direction === 'BIDIRECTIONAL') {
        exportResult = await OVDService.exportOVDFile(
          userId,
          voyageId || null,
          dateRange || {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          }
        );
      }
      
      res.json({
        code: 'SUCCESS',
        message: 'Manual sync triggered successfully',
        data: {
          direction,
          exportResult
        },
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error triggering manual sync:', error);
      
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to trigger manual sync',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  /**
   * GET /api/voyages/ovd/sync-status
   * Get current sync status and history
   */
  async getSyncStatus(req: AuthRequest, res: Response) {
    try {
      const { limit = '10' } = req.query;
      
      const syncHistory = await OVDService.getSyncStatus(parseInt(limit as string));
      
      res.json({
        code: 'SUCCESS',
        message: 'Sync status retrieved successfully',
        data: syncHistory,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error getting sync status:', error);
      
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to get sync status',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  /**
   * GET /api/voyages/ovd/schedule
   * Get sync schedule configuration
   */
  async getSyncSchedule(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.user?.organizationId;
      
      const syncConfigs = await OVDService.getSyncConfig(organizationId);
      
      res.json({
        code: 'SUCCESS',
        message: 'Sync schedule retrieved successfully',
        data: syncConfigs,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error getting sync schedule:', error);
      
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to get sync schedule',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  /**
   * POST /api/voyages/ovd/schedule
   * Configure automated sync schedule
   */
  async configureSyncSchedule(req: AuthRequest, res: Response) {
    try {
      const {
        configName,
        enabled,
        syncDirection,
        scheduleFrequency,
        cronExpression,
        vesselFilter,
        dateRangeFilter,
        autoApprove,
        notificationEmails,
        notifyOnError,
        notifyOnSuccess
      } = req.body;
      
      const userId = req.user?.id || 'unknown';
      const organizationId = req.user?.organizationId;
      
      // Validate required fields
      if (!configName || !syncDirection || !scheduleFrequency) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'configName, syncDirection, and scheduleFrequency are required',
          traceId: req.headers['x-trace-id']
        });
      }
      
      // Insert sync configuration
      const result = await pool.query(
        `INSERT INTO ovd_sync_config (
          config_name, enabled, sync_direction, schedule_frequency,
          cron_expression, organization_id, vessel_filter, date_range_filter,
          auto_approve, notification_emails, notify_on_error, notify_on_success,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          configName,
          enabled || false,
          syncDirection,
          scheduleFrequency,
          cronExpression || null,
          organizationId || null,
          vesselFilter ? JSON.stringify(vesselFilter) : null,
          dateRangeFilter ? JSON.stringify(dateRangeFilter) : null,
          autoApprove || false,
          notificationEmails || [],
          notifyOnError !== undefined ? notifyOnError : true,
          notifyOnSuccess || false,
          userId
        ]
      );
      
      const newConfig = result.rows[0];
      
      // If enabled, schedule the sync job
      if (enabled) {
        await syncScheduler.scheduleSync(newConfig);
      }
      
      // Log audit event
      await logAuditEvent(createAuditEntry(
        req,
        'CREATE_SYNC_CONFIG',
        'SUCCESS',
        { 
          entityType: 'SYNC_CONFIG',
          entityId: newConfig.id,
          metadata: { configName, syncDirection, scheduleFrequency }
        }
      ));
      
      res.status(201).json({
        code: 'SUCCESS',
        message: 'Sync schedule configured successfully',
        data: newConfig,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error configuring sync schedule:', error);
      
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to configure sync schedule',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  /**
   * PATCH /api/voyages/ovd/schedule/:id
   * Update sync schedule configuration
   */
  async updateSyncSchedule(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user?.id || 'unknown';
      
      // Get current config
      const currentResult = await pool.query(
        'SELECT * FROM ovd_sync_config WHERE id = $1',
        [id]
      );
      
      if (currentResult.rows.length === 0) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Sync configuration not found',
          traceId: req.headers['x-trace-id']
        });
      }
      
      const currentConfig = currentResult.rows[0];
      
      // Build update query
      const allowedFields = [
        'config_name', 'enabled', 'sync_direction', 'schedule_frequency',
        'cron_expression', 'vessel_filter', 'date_range_filter',
        'auto_approve', 'notification_emails', 'notify_on_error', 'notify_on_success'
      ];
      
      const setClause: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          setClause.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
          paramCount++;
        }
      });
      
      if (setClause.length === 0) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'No valid fields to update',
          traceId: req.headers['x-trace-id']
        });
      }
      
      values.push(id);
      
      const query = `
        UPDATE ovd_sync_config
        SET ${setClause.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
      
      const result = await pool.query(query, values);
      const updatedConfig = result.rows[0];
      
      // Reschedule if enabled status changed
      if (updates.enabled !== undefined) {
        if (updates.enabled) {
          await syncScheduler.scheduleSync(updatedConfig);
        } else {
          syncScheduler.stopSync(id);
        }
      }
      
      // Log audit event
      await logAuditEvent(createAuditEntry(
        req,
        'UPDATE_SYNC_CONFIG',
        'SUCCESS',
        {
          entityType: 'SYNC_CONFIG',
          entityId: id,
          changes: { before: currentConfig, after: updatedConfig }
        }
      ));
      
      res.json({
        code: 'SUCCESS',
        message: 'Sync schedule updated successfully',
        data: updatedConfig,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error updating sync schedule:', error);
      
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to update sync schedule',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  /**
   * DELETE /api/voyages/ovd/schedule/:id
   * Delete sync schedule configuration
   */
  async deleteSyncSchedule(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      // Stop the scheduled job
      syncScheduler.stopSync(id);
      
      // Delete from database
      const result = await pool.query(
        'DELETE FROM ovd_sync_config WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Sync configuration not found',
          traceId: req.headers['x-trace-id']
        });
      }
      
      // Log audit event
      await logAuditEvent(createAuditEntry(
        req,
        'DELETE_SYNC_CONFIG',
        'SUCCESS',
        { 
          entityType: 'SYNC_CONFIG',
          entityId: id
        }
      ));
      
      res.json({
        code: 'SUCCESS',
        message: 'Sync schedule deleted successfully',
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error deleting sync schedule:', error);
      
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to delete sync schedule',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  /**
   * GET /api/voyages/ovd/audit-log
   * Get audit log for OVD operations
   */
  async getAuditLog(req: AuthRequest, res: Response) {
    try {
      const { limit = '50', actionType, result, startDate, endDate } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;
      
      if (actionType) {
        whereClause += ` AND action_type = $${paramCount}`;
        params.push(actionType);
        paramCount++;
      }
      
      if (result) {
        whereClause += ` AND result = $${paramCount}`;
        params.push(result);
        paramCount++;
      }
      
      if (startDate) {
        whereClause += ` AND created_at >= $${paramCount}`;
        params.push(startDate);
        paramCount++;
      }
      
      if (endDate) {
        whereClause += ` AND created_at <= $${paramCount}`;
        params.push(endDate);
        paramCount++;
      }
      
      const query = `
        SELECT 
          id, user_id, user_email, user_role, action_type,
          entity_type, entity_id, result, error_message, created_at, metadata
        FROM ovd_audit_log
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramCount}
      `;
      
      params.push(parseInt(limit as string));
      
      const auditResult = await pool.query(query, params);
      
      res.json({
        code: 'SUCCESS',
        message: 'Audit log retrieved successfully',
        data: auditResult.rows,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      console.error('Error getting audit log:', error);
      
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to get audit log',
        traceId: req.headers['x-trace-id']
      });
    }
  }
}

