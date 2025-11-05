/**
 * Port Service - Fetches port data from backend API
 */

export interface Port {
  id: number;
  unlocode: string;
  name: string;
  country_code: string;
  latitude: number;
  longitude: number;
  function_code?: string;
  iata_code?: string;
  subdivision?: string;
}

const API_BASE_URL = 'http://localhost:8080/vessels/api/ports';

/**
 * Search for ports by name
 */
export async function searchPorts(query: string, limit: number = 20): Promise<Port[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching ports:', error);
    return [];
  }
}

/**
 * Get port by UNLOCODE
 */
export async function getPortByUnlocode(unlocode: string): Promise<Port | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${unlocode.toUpperCase()}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching port:', error);
    return null;
  }
}

/**
 * Get all ports with filtering
 */
export async function getPorts(search?: string, country?: string, limit: number = 100, offset: number = 0) {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (country) params.append('country', country);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    const response = await fetch(`${API_BASE_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching ports:', error);
    return { ports: [], total: 0, limit, offset };
  }
}

/**
 * Get nearby ports within radius (in km)
 */
export async function getNearbyPorts(lat: number, lon: number, radius: number = 50, limit: number = 20): Promise<Port[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/nearby?lat=${lat}&lon=${lon}&radius=${radius}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching nearby ports:', error);
    return [];
  }
}

/**
 * Get common ports for dropdown selections
 */
export function getCommonPorts(): Array<{ unlocode: string; name: string; lat: number; lng: number }> {
  // Fallback list of common ports
  return [
    { unlocode: 'NLRTM', name: 'Rotterdam, Netherlands', lat: 51.9167, lng: 4.5 },
    { unlocode: 'USNYC', name: 'New York, USA', lat: 40.7, lng: -74.0 },
    { unlocode: 'SGSIN', name: 'Singapore', lat: 1.2833, lng: 103.85 },
    { unlocode: 'CNSHA', name: 'Shanghai, China', lat: 31.23, lng: 121.47 },
    { unlocode: 'AEDXB', name: 'Dubai, UAE', lat: 25.27, lng: 55.33 },
    { unlocode: 'DEHAM', name: 'Hamburg, Germany', lat: 53.55, lng: 9.99 },
    { unlocode: 'USLAX', name: 'Los Angeles, USA', lat: 33.72, lng: -118.27 },
    { unlocode: 'BRSSZ', name: 'Santos, Brazil', lat: -23.96, lng: -46.33 },
    { unlocode: 'HKHKG', name: 'Hong Kong', lat: 22.32, lng: 114.17 },
    { unlocode: 'GBLGP', name: 'London Gateway, UK', lat: 51.5, lng: 0.57 },
    { unlocode: 'EGPSD', name: 'Port Said, Egypt', lat: 31.27, lng: 32.30 }
  ];
}

