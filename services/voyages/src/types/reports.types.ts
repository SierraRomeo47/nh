// DNV Standard Vessel Reporting Types

export interface NoonReport {
  id?: string;
  voyage_id: string;
  ship_id: string;
  report_date: string;
  report_time?: string;
  
  // Position
  latitude_degrees?: number;
  latitude_direction?: 'N' | 'S';
  longitude_degrees?: number;
  longitude_direction?: 'E' | 'W';
  position_description?: string;
  
  // Voyage
  voyage_leg?: number;
  voyage_type?: 'LADEN' | 'BALLAST' | 'IN_PORT';
  course_degrees?: number;
  distance_to_go_nm?: number;
  distance_sailed_24h_nm?: number;
  eta_next_port?: string;
  next_port?: string;
  
  // Speed and Performance
  average_speed_knots?: number;
  engine_rpm?: number;
  slip_percentage?: number;
  
  // Weather
  wind_direction_degrees?: number;
  wind_force_beaufort?: number;
  wind_speed_knots?: number;
  sea_state?: number;
  swell_height_m?: number;
  air_temperature_c?: number;
  sea_temperature_c?: number;
  
  // Cargo
  cargo_on_board_mt?: number;
  cargo_grade?: string;
  ballast_on_board_mt?: number;
  
  // Fuel Consumption (24h)
  me_fo_consumption_mt?: number;
  me_do_consumption_mt?: number;
  me_lng_consumption_mt?: number;
  ae_consumption_mt?: number;
  boiler_consumption_mt?: number;
  
  // Fuel ROB
  fo_rob_mt?: number;
  do_rob_mt?: number;
  lng_rob_mt?: number;
  
  // Performance
  me_running_hours?: number;
  ae_running_hours?: number;
  
  // Remarks
  remarks?: string;
  heavy_weather?: boolean;
  reduced_speed?: boolean;
  
  // Officers
  master_name?: string;
  chief_engineer_name?: string;
}

export interface BunkerReport {
  id?: string;
  ship_id: string;
  voyage_id?: string;
  
  // Bunker Operation
  bunkering_port: string;
  bunkering_port_unlocode?: string;
  bunker_date: string;
  bunker_start_time?: string;
  bunker_end_time?: string;
  
  // Fuel Details
  fuel_type: string;
  fuel_grade?: string;
  quantity_received_mt: number;
  quantity_ordered_mt?: number;
  temperature_c?: number;
  
  // Supplier
  supplier_name: string;
  supplier_contact?: string;
  barge_name?: string;
  delivery_note_number?: string;
  
  // Quality
  density_15c_kg_m3?: number;
  viscosity_50c_cst?: number;
  sulphur_content_pct?: number;
  flash_point_c?: number;
  
  // Calorific Values
  lower_calorific_value_mj_kg?: number;
  higher_calorific_value_mj_kg?: number;
  
  // Chemistry
  carbon_content_pct?: number;
  
  // Biofuel
  biofuel_component?: boolean;
  biofuel_percentage?: number;
  
  // Financial
  unit_price_usd_per_mt?: number;
  total_cost_usd?: number;
  
  // ROB
  rob_before_mt?: number;
  rob_after_mt?: number;
  
  // Quality
  sample_taken?: boolean;
  quality_acceptance_status?: 'ACCEPTED' | 'DISPUTED' | 'REJECTED' | 'PENDING';
}

export interface SOFReport {
  id?: string;
  ship_id: string;
  voyage_id?: string;
  
  // Port Info
  port_name: string;
  port_unlocode?: string;
  terminal_name?: string;
  berth_number?: string;
  
  // Arrival
  arrival_pilot_station?: string;
  arrival_anchorage?: string;
  arrival_berth?: string;
  all_fast?: string;
  
  // Documentation
  nor_tendered?: string;
  nor_accepted?: string;
  free_pratique_granted?: string;
  
  // Cargo Operations
  cargo_operation_commenced?: string;
  cargo_operation_completed?: string;
  hoses_connected?: string;
  hoses_disconnected?: string;
  
  // Cargo Details
  cargo_type?: string;
  cargo_loaded_mt?: number;
  cargo_discharged_mt?: number;
  loading_rate_mt_hr?: number;
  discharge_rate_mt_hr?: number;
  
  // Delays
  waiting_for_berth_hours?: number;
  weather_delay_hours?: number;
  cargo_delay_hours?: number;
  delay_reasons?: string;
  
  // Departure
  port_clearance_granted?: string;
  last_line_let_go?: string;
  departure_pilot_station?: string;
  
  // Laytime
  time_at_berth_hours?: number;
  laytime_used_hours?: number;
  allowed_laytime_hours?: number;
  demurrage_hours?: number;
  despatch_hours?: number;
  
  // Port Costs
  port_charges_usd?: number;
  pilotage_charges_usd?: number;
  tug_charges_usd?: number;
  
  // Services
  tugs_used?: number;
  pilots_used?: number;
  
  // Agent
  agent_name?: string;
  master_signature?: string;
  agent_signature?: string;
  
  // Remarks
  general_remarks?: string;
  protest_issued?: boolean;
}

