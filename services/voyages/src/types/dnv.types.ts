// DNV OVDLA (Operational Vessel Data and Log Analysis) Types
// Based on 157-field schema from DNV JSON format

export interface DNVOVDLARecord {
  // Date and Time
  Date_UTC?: string;
  Time_UTC?: string;
  
  // Vessel Identification
  IMO?: string;
  
  // Voyage Information
  Event?: string;
  Voyage_From?: string;
  Voyage_To?: string;
  Voyage_Number?: string;
  Voyage_Leg?: string;
  Voyage_Type?: string;
  Purposes_Of_Call?: string;
  Offhire_Reasons?: string;
  
  // Activities and Time Tracking
  Activity_1?: string;
  Time_Elapsed_Activity_1?: number;
  Activity_2?: string;
  Time_Elapsed_Activity_2?: number;
  Time_Since_Previous_Report?: number;
  Time_Elapsed_Anchoring?: number;
  Time_Elapsed_Sailing?: number;
  Time_Elapsed_Drifting?: number;
  Time_Elapsed_Maneuvering?: number;
  Time_Elapsed_Waiting?: number;
  Time_Elapsed_Loading_Unloading?: number;
  Time_Elapsed_Ice?: number;
  
  // Position and Distance
  Distance?: number;
  Latitude_North_South?: string;
  Latitude_Degree?: number;
  Latitude_Minutes?: number;
  Longitude_East_West?: string;
  Longitude_Degree?: number;
  Longitude_Minutes?: number;
  
  // Cargo Information
  Cargo_Mt?: number;
  Cargo_m3?: number;
  Deadweight_Carried?: number;
  Cargo_Total_TEU?: number;
  Cargo_Reefer_TEU?: number;
  Cargo_CEU?: number;
  Passengers?: number;
  Crew?: number;
  Reefer_20_Chilled?: number;
  Reefer_40_Chilled?: number;
  Reefer_20_Frozen?: number;
  Reefer_40_Frozen?: number;
  
  // Weather
  Wind_Dir?: number;
  Wind_Force_Kn?: number;
  Wind_Force_Bft?: number;
  
  // Main Engine Consumption
  ME_Consumption_HFO?: number;
  ME_Consumption_LFO?: number;
  ME_Consumption_MGO?: number;
  ME_Consumption_MDO?: number;
  ME_Consumption_O?: number;
  ME_Consumption_O_type?: string;
  ME_Consumption_LPGP?: number;
  ME_Consumption_LPGB?: number;
  ME_Consumption_LNG?: number;
  ME_Consumption_M?: number;
  ME_Consumption_E?: number;
  
  // Auxiliary Engine Consumption
  AE_Consumption_HFO?: number;
  AE_Consumption_LFO?: number;
  AE_Consumption_MGO?: number;
  AE_Consumption_MDO?: number;
  AE_Consumption_O?: number;
  AE_Consumption_O_type?: string;
  AE_Consumption_LPGP?: number;
  AE_Consumption_LPGB?: number;
  AE_Consumption_LNG?: number;
  AE_Consumption_M?: number;
  AE_Consumption_E?: number;
  
  // Boiler Consumption
  Boiler_Consumption_HFO?: number;
  Boiler_Consumption_LFO?: number;
  Boiler_Consumption_MGO?: number;
  Boiler_Consumption_MDO?: number;
  Boiler_Consumption_O?: number;
  Boiler_Consumption_O_Type?: string;
  Boiler_Consumption_LPGP?: number;
  Boiler_Consumption_LPGB?: number;
  Boiler_Consumption_LNG?: number;
  Boiler_Consumption_M?: number;
  Boiler_Consumption_E?: number;
  
  // Inert Gas Generator Consumption
  Inert_gas_Consumption_HFO?: number;
  Inert_gas_Consumption_LFO?: number;
  Inert_gas_Consumption_MGO?: number;
  Inert_gas_Consumption_MDO?: number;
  Inert_gas_Consumption_O?: number;
  Inert_gas_Consumption_O_Type?: string;
  Inert_gas_Consumption_LPGP?: number;
  Inert_gas_Consumption_LPGB?: number;
  Inert_gas_Consumption_LNG?: number;
  Inert_gas_Consumption_M?: number;
  Inert_gas_Consumption_E?: number;
  
  // Remain on Board (ROB)
  HFO_ROB?: number;
  LFO_ROB?: number;
  MGO_ROB?: number;
  MDO_ROB?: number;
  LPGP_ROB?: number;
  LPGB_ROB?: number;
  LNG_ROB?: number;
  Methanol_ROB?: number;
  Ethanol_ROB?: number;
  O_ROB?: number;
  O_ROB_type?: string;
  
  // Cargo Handling Equipment
  Reefer_Work?: number;
  Reefer_SFOC?: number;
  Reefer_Fuel_Type?: string;
  Reefer_Fuel_BDN?: string;
  Cargo_Cooling_Work?: number;
  Cargo_Cooling_SFOC?: number;
  Cargo_Cooling_Fuel_Type?: string;
  Cargo_Cooling_Fuel_BDN?: string;
  Discharge_Pump_Work?: number;
  Discharge_Pump_SFOC?: number;
  Discharge_Pump_Fuel_Type?: string;
  Discharge_Pump_Fuel_BDN?: string;
  
  // Onshore Power Supply
  Shore_Side_Electricity_Reception?: number;
  
  // Cargo Heating
  Cargo_heating_Consumption_HFO?: number;
  Cargo_heating_Consumption_LFO?: number;
  Cargo_heating_Consumption_MGO?: number;
  Cargo_heating_Consumption_MDO?: number;
  Cargo_heating_Consumption_LPGP?: number;
  Cargo_heating_Consumption_LPGB?: number;
  Cargo_heating_Consumption_LNG?: number;
  Cargo_heating_Consumption_M?: number;
  Cargo_heating_Consumption_E?: number;
  Cargo_heating_Consumption_O?: number;
  Cargo_heating_Consumption_O_type?: string;
  Cargo_Heating_Consumption_BDN?: string;
  Cargo_Heating_Fuel_BDN?: string;
  
  // DPP Cargo Pump
  DPP_Cargo_Pump_Consumption_MDO?: number;
  DPP_Cargo_Pump_Consumption_O?: number;
  DPP_Cargo_Pump_Consumption_O_type?: string;
  DPP_Cargo_Pump_Consumption_BDN?: string;
  DPP_Cargo_Pump_Fuel_BDN?: string;
  
  // Ice Navigation
  Distance_ice?: number;
  
  // Bunker Delivery Notes
  ME_Fuel_BDN?: string;
  ME_Consumption?: number;
  ME_Fuel_BDN_2?: string;
  ME_Consumption_BDN_2?: number;
  ME_Fuel_BDN_3?: string;
  ME_Consumption_BDN_3?: number;
  ME_Fuel_BDN_4?: string;
  ME_Consumption_BDN_4?: number;
  AE_Fuel_BDN?: string;
  AE_Consumption?: number;
  Boiler_Consumption?: number;
  DPP_Consumption?: number;
  IGG_Consumption?: number;
  GCU_Consumption?: number;
  Incinerator_Consumption?: number;
  AE_Fuel_BDN_2?: string;
  AE_Consumption_BDN_2?: number;
  Boiler_Consumption_BDN_2?: number;
  AE_Fuel_BDN_3?: string;
  AE_Consumption_BDN_3?: number;
  Boiler_Consumption_BDN_3?: number;
  AE_Fuel_BDN_4?: string;
  AE_Consumption_BDN_4?: number;
  Boiler_Consumption_BDN_4?: number;
  
  // ROB by BDN
  ROB_Fuel_BDN?: string;
  BDN_ROB?: number;
  ROB_Fuel_BDN_2?: string;
  BDN_2_ROB?: number;
  ROB_Fuel_BDN_3?: string;
  BDN_3_ROB?: number;
  ROB_Fuel_BDN_4?: string;
  BDN_4_ROB?: number;
  ROB_Fuel_BDN_5?: string;
  BDN_5_ROB?: number;
  ROB_Fuel_BDN_6?: string;
  BDN_6_ROB?: number;
  ROB_Fuel_BDN_7?: string;
  BDN_7_ROB?: number;
  ROB_Fuel_BDN_8?: string;
  BDN_8_ROB?: number;
  ROB_Fuel_Total?: number;
}

export interface DNVOVDLARequest {
  companyId: string;
  data: {
    interfaceCode: string;
    dataType: string;
    data: string[][];
  };
}

// Field mapping from DNV to internal database schema
export interface DNVFieldMapping {
  dnvField: keyof DNVOVDLARecord;
  dbField: string;
  dbTable: string;
  transform?: (value: any) => any;
}


