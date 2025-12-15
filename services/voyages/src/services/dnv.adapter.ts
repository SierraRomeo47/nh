// DNV OVDLA Adapter Service
// Converts DNV JSON format to internal database schema
// Enhanced for OVD 3.10.1 Excel file support

import { DNVOVDLARecord, DNVOVDLARequest, DNVFieldMapping } from '../types/dnv.types';
import * as XLSX from 'xlsx';
import fs from 'fs';

export class DNVAdapter {
  /**
   * Parse DNV OVDLA JSON format
   */
  static parseOVDLARequest(request: DNVOVDLARequest): DNVOVDLARecord[] {
    const headers = request.data.data[0];
    const records: DNVOVDLARecord[] = [];
    
    for (let i = 1; i < request.data.data.length; i++) {
      const row = request.data.data[i];
      const record: any = {};
      
      headers.forEach((header, index) => {
        if (row[index] !== undefined && row[index] !== '') {
          record[header] = row[index];
        }
      });
      
      records.push(record as DNVOVDLARecord);
    }
    
    return records;
  }
  
  /**
   * Map DNV record to fuel consumption entry
   */
  static mapToFuelConsumption(dnvRecord: DNVOVDLARecord, voyageId: string): any {
    // Extract fuel consumption data from ME, AE, Boiler, IGG
    const fuelEntries: any[] = [];
    
    // Main Engine consumption
    if (dnvRecord.ME_Consumption_HFO) {
      fuelEntries.push({
        voyage_id: voyageId,
        fuel_type: 'HFO',
        fuel_category: 'FOSSIL',
        consumption_tonnes: dnvRecord.ME_Consumption_HFO,
        consumption_date: dnvRecord.Date_UTC,
        engine_type: 'MAIN_ENGINE',
        fuel_supplier: dnvRecord.ME_Fuel_BDN,
        bunker_delivery_note: dnvRecord.ME_Fuel_BDN
      });
    }
    
    if (dnvRecord.ME_Consumption_MGO) {
      fuelEntries.push({
        voyage_id: voyageId,
        fuel_type: 'MGO',
        fuel_category: 'FOSSIL',
        consumption_tonnes: dnvRecord.ME_Consumption_MGO,
        consumption_date: dnvRecord.Date_UTC,
        engine_type: 'MAIN_ENGINE',
        fuel_supplier: dnvRecord.ME_Fuel_BDN,
        bunker_delivery_note: dnvRecord.ME_Fuel_BDN
      });
    }
    
    if (dnvRecord.ME_Consumption_LNG) {
      fuelEntries.push({
        voyage_id: voyageId,
        fuel_type: 'LNG',
        fuel_category: 'FOSSIL',
        consumption_tonnes: dnvRecord.ME_Consumption_LNG,
        consumption_date: dnvRecord.Date_UTC,
        engine_type: 'MAIN_ENGINE',
        bunker_delivery_note: dnvRecord.ME_Fuel_BDN
      });
    }
    
    // Auxiliary Engine consumption
    if (dnvRecord.AE_Consumption_MGO) {
      fuelEntries.push({
        voyage_id: voyageId,
        fuel_type: 'MGO',
        fuel_category: 'FOSSIL',
        consumption_tonnes: dnvRecord.AE_Consumption_MGO,
        consumption_date: dnvRecord.Date_UTC,
        engine_type: 'AUXILIARY_ENGINE',
        fuel_supplier: dnvRecord.AE_Fuel_BDN,
        bunker_delivery_note: dnvRecord.AE_Fuel_BDN
      });
    }
    
    // Boiler consumption
    if (dnvRecord.Boiler_Consumption_HFO) {
      fuelEntries.push({
        voyage_id: voyageId,
        fuel_type: 'HFO',
        fuel_category: 'FOSSIL',
        consumption_tonnes: dnvRecord.Boiler_Consumption_HFO,
        consumption_date: dnvRecord.Date_UTC,
        engine_type: 'BOILER',
        bunker_delivery_note: dnvRecord.AE_Fuel_BDN // Boiler typically uses AE fuel supply
      });
    }
    
    // Onshore Power Supply
    if (dnvRecord.Shore_Side_Electricity_Reception) {
      fuelEntries.push({
        voyage_id: voyageId,
        fuel_type: 'GRID_ELECTRICITY',
        fuel_category: 'ELECTRIC',
        energy_source_type: 'OPS',
        energy_consumption_kwh: dnvRecord.Shore_Side_Electricity_Reception,
        consumption_date: dnvRecord.Date_UTC
      });
    }
    
    return fuelEntries;
  }
  
  /**
   * Generate DNV export format from internal data
   */
  static generateOVDLAFormat(fuelConsumptionData: any[]): string[][] {
    const headers = [
      'Date_UTC', 'Time_UTC', 'IMO', 'Event', 'Voyage_From', 'Voyage_To',
      'Voyage_Number', 'Voyage_Leg', 'Voyage_Type', 'ME_Consumption_HFO',
      'ME_Consumption_MGO', 'ME_Consumption_LNG', 'AE_Consumption_MGO',
      'Boiler_Consumption_HFO', 'Shore_Side_Electricity_Reception'
    ];
    
    const rows: string[][] = [headers];
    
    fuelConsumptionData.forEach(entry => {
      const row: string[] = [
        entry.consumption_date || '',
        '',
        entry.imo_number || '',
        '',
        entry.departure_port || '',
        entry.arrival_port || '',
        entry.voyage_number || '',
        entry.leg_number?.toString() || '',
        entry.voyage_type || '',
        entry.fuel_type === 'HFO' && entry.engine_type === 'MAIN_ENGINE' ? entry.consumption_tonnes?.toString() || '' : '',
        entry.fuel_type === 'MGO' && entry.engine_type === 'MAIN_ENGINE' ? entry.consumption_tonnes?.toString() || '' : '',
        entry.fuel_type === 'LNG' && entry.engine_type === 'MAIN_ENGINE' ? entry.consumption_tonnes?.toString() || '' : '',
        entry.fuel_type === 'MGO' && entry.engine_type === 'AUXILIARY_ENGINE' ? entry.consumption_tonnes?.toString() || '' : '',
        entry.fuel_type === 'HFO' && entry.engine_type === 'BOILER' ? entry.consumption_tonnes?.toString() || '' : '',
        entry.energy_source_type === 'OPS' ? entry.energy_consumption_kwh?.toString() || '' : ''
      ];
      rows.push(row);
    });
    
    return rows;
  }
  
  /**
   * Validate DNV data structure
   */
  static validateDNVData(request: DNVOVDLARequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!request.companyId) {
      errors.push('Missing companyId');
    }
    
    if (!request.data || !request.data.data) {
      errors.push('Missing data array');
      return { valid: false, errors };
    }
    
    if (request.data.data.length < 2) {
      errors.push('Data array must contain at least headers and one data row');
    }
    
    if (request.data.interfaceCode !== 'OVDLA') {
      errors.push('Invalid interfaceCode. Expected OVDLA');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Parse OVD Excel file and convert to DNV records
   * @param filePath Path to the uploaded Excel file
   * @returns Array of DNV OVDLA records
   */
  static parseOVDExcelFile(filePath: string): { records: DNVOVDLARecord[]; metadata: any } {
    try {
      // Read the Excel file
      const workbook = XLSX.readFile(filePath);
      
      // Get the first sheet (assuming OVD data is in the first sheet)
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert sheet to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
      
      // Map Excel rows to DNV records
      const records: DNVOVDLARecord[] = jsonData.map((row: any) => {
        return this.mapExcelRowToDNVRecord(row);
      });
      
      // Extract metadata
      const metadata = {
        fileName: filePath.split('/').pop(),
        sheetName,
        recordCount: records.length,
        dateRange: this.extractDateRange(records),
        vessels: this.extractUniqueVessels(records)
      };
      
      return { records, metadata };
    } catch (error: any) {
      throw new Error(`Failed to parse OVD Excel file: ${error.message}`);
    }
  }
  
  /**
   * Generate OVD Excel file from fuel consumption data
   * @param fuelConsumptionData Array of fuel consumption records
   * @returns Excel file buffer
   */
  static generateOVDExcelFile(fuelConsumptionData: any[]): Buffer {
    try {
      // Generate the data rows
      const rows = this.generateOVDLAFormat(fuelConsumptionData);
      
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'OVD Data');
      
      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return buffer;
    } catch (error: any) {
      throw new Error(`Failed to generate OVD Excel file: ${error.message}`);
    }
  }
  
  /**
   * Map Excel row to DNV record (handles different column naming conventions)
   */
  private static mapExcelRowToDNVRecord(row: any): DNVOVDLARecord {
    const record: DNVOVDLARecord = {};
    
    // Map all possible field names (case-insensitive)
    const fieldMappings: { [key: string]: keyof DNVOVDLARecord } = {
      'date_utc': 'Date_UTC',
      'date utc': 'Date_UTC',
      'date': 'Date_UTC',
      'time_utc': 'Time_UTC',
      'time utc': 'Time_UTC',
      'time': 'Time_UTC',
      'imo': 'IMO',
      'imo number': 'IMO',
      'event': 'Event',
      'voyage_from': 'Voyage_From',
      'voyage from': 'Voyage_From',
      'voyage_to': 'Voyage_To',
      'voyage to': 'Voyage_To',
      'voyage_number': 'Voyage_Number',
      'voyage number': 'Voyage_Number',
      'voyage_leg': 'Voyage_Leg',
      'voyage leg': 'Voyage_Leg',
      'me_consumption_hfo': 'ME_Consumption_HFO',
      'me consumption hfo': 'ME_Consumption_HFO',
      'me_consumption_mgo': 'ME_Consumption_MGO',
      'me consumption mgo': 'ME_Consumption_MGO',
      'me_consumption_lng': 'ME_Consumption_LNG',
      'me consumption lng': 'ME_Consumption_LNG',
      'ae_consumption_mgo': 'AE_Consumption_MGO',
      'ae consumption mgo': 'AE_Consumption_MGO',
      'boiler_consumption_hfo': 'Boiler_Consumption_HFO',
      'boiler consumption hfo': 'Boiler_Consumption_HFO',
      'shore_side_electricity_reception': 'Shore_Side_Electricity_Reception',
      'shore side electricity reception': 'Shore_Side_Electricity_Reception'
      // Add more mappings as needed for all 157+ fields
    };
    
    // Map each field from the row
    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().trim();
      const mappedKey = fieldMappings[normalizedKey];
      
      if (mappedKey) {
        record[mappedKey] = row[key];
      } else {
        // Try direct mapping if key matches
        const directKey = key.replace(/ /g, '_') as keyof DNVOVDLARecord;
        if (directKey in record || true) { // Allow any field
          (record as any)[directKey] = row[key];
        }
      }
    });
    
    return record;
  }
  
  /**
   * Extract date range from records
   */
  private static extractDateRange(records: DNVOVDLARecord[]): { start: string | null; end: string | null } {
    const dates = records
      .map(r => r.Date_UTC)
      .filter(d => d != null)
      .sort();
    
    return {
      start: dates.length > 0 ? dates[0]! : null,
      end: dates.length > 0 ? dates[dates.length - 1]! : null
    };
  }
  
  /**
   * Extract unique vessels from records
   */
  private static extractUniqueVessels(records: DNVOVDLARecord[]): string[] {
    const vessels = new Set<string>();
    records.forEach(r => {
      if (r.IMO) {
        vessels.add(r.IMO);
      }
    });
    return Array.from(vessels);
  }
  
  /**
   * Validate OVD 3.10.1 format
   */
  static validateOVD310Format(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!Array.isArray(data)) {
      errors.push('Data must be an array');
      return { valid: false, errors };
    }
    
    if (data.length === 0) {
      errors.push('Data array is empty');
      return { valid: false, errors };
    }
    
    // Check for required fields
    const requiredFields = ['Date_UTC', 'IMO'];
    data.forEach((record, index) => {
      requiredFields.forEach(field => {
        if (!record[field]) {
          errors.push(`Record ${index + 1}: Missing required field '${field}'`);
        }
      });
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}


