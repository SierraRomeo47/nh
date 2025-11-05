// DNV OVDLA Adapter Service
// Converts DNV JSON format to internal database schema

import { DNVOVDLARecord, DNVOVDLARequest, DNVFieldMapping } from '../types/dnv.types';

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
}


