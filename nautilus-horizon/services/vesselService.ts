/**
 * Vessel Service - Fetches vessel data from backend API
 */

export interface Vessel {
  id: string;
  imo: string;
  name: string;
  ship_type: string;
  segment?: string;
  dwt?: number;
  flag?: string;
  min_speed_knots?: number;
  max_speed_knots?: number;
  port_consumption?: number;
  sea_consumption?: number;
}

interface BackendVessel {
  id: string;
  imo_number: string;
  name: string;
  ship_type: string;
  deadweight_tonnage?: number;
  flag_state?: string;
  min_speed?: number;
  max_speed?: number;
  port_consumption?: number;
  sea_consumption?: number;
}

const API_BASE_URL = 'http://localhost:8080/vessels/api/vessels';

/**
 * Get all vessels
 */
export async function getVessels(): Promise<Vessel[]> {
  try {
    console.log('🚢 Fetching vessels from backend API...');
    
    const response = await fetch(API_BASE_URL, {
      credentials: 'include', // Include cookies for auth
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Backend API returned status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`✅ Fetched ${result.data?.length || 0} vessels from backend`);
    
    // Map backend response to frontend interface
    const vessels: Vessel[] = (result.data || []).map((v: BackendVessel) => ({
      id: v.id,
      imo: v.imo_number,
      name: v.name,
      ship_type: v.ship_type,
      segment: v.ship_type, // Using ship_type as segment
      dwt: v.deadweight_tonnage,
      flag: v.flag_state,
      min_speed_knots: v.min_speed ? parseFloat(v.min_speed) : 12,
      max_speed_knots: v.max_speed ? parseFloat(v.max_speed) : 16,
      port_consumption: v.port_consumption ? parseFloat(v.port_consumption) : 8.0,
      sea_consumption: v.sea_consumption ? parseFloat(v.sea_consumption) : 45.0,
    }));
    
    if (vessels.length === 0) {
      throw new Error('No vessels found in database');
    }
    
    return vessels;
  } catch (error) {
    console.error('❌ Error fetching vessels from database:', error);
    throw error; // Don't fallback to mock data, throw the error
  }
}

/**
 * Search for vessels by name or IMO
 */
export async function searchVessels(query: string): Promise<Vessel[]> {
  try {
    const vessels = await getVessels();
    const lowerQuery = query.toLowerCase();
    return vessels.filter(v => 
      v.name.toLowerCase().includes(lowerQuery) || 
      v.imo.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('Error searching vessels:', error);
    return [];
  }
}

/**
 * Get vessel by IMO
 */
export async function getVesselByImo(imo: string): Promise<Vessel | null> {
  try {
    const vessels = await getVessels();
    return vessels.find(v => v.imo === imo) || null;
  } catch (error) {
    console.error('Error fetching vessel:', error);
    return null;
  }
}

// Mock vessels removed - using database only

