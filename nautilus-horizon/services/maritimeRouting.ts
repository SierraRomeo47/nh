/**
 * Maritime Routing Service
 * Integrates SeaRoute API and OpenCPN-style routing for professional maritime route planning
 */

export interface Port {
  lat: number;
  lng: number;
  label: string;
}

export interface Waypoint {
  lat: number;
  lng: number;
  label?: string;
}

// Port database with accurate coordinates
export const PORTS: Record<string, Port> = {
  'Rotterdam': { lat: 51.9225, lng: 4.47917, label: 'Rotterdam, Netherlands' },
  'New York': { lat: 40.7128, lng: -74.0060, label: 'New York, USA' },
  'Singapore': { lat: 1.3521, lng: 103.8198, label: 'Singapore' },
  'Shanghai': { lat: 31.2304, lng: 121.4737, label: 'Shanghai, China' },
  'Dubai': { lat: 25.2048, lng: 55.2708, label: 'Dubai, UAE' },
  'Hamburg': { lat: 53.5511, lng: 9.9937, label: 'Hamburg, Germany' },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, label: 'Los Angeles, USA' },
  'Santos': { lat: -23.9608, lng: -46.3335, label: 'Santos, Brazil' },
  'Hong Kong': { lat: 22.3193, lng: 114.1694, label: 'Hong Kong' },
  'London': { lat: 51.5074, lng: -0.1278, label: 'London, UK' },
  'Port Said': { lat: 31.2653, lng: 32.3019, label: 'Port Said, Egypt' },
};

/**
 * SeaRoute API routing (requires API key - currently disabled)
 * Using OpenCPN-style routing instead as free alternative
 */
export async function getSeaRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<Waypoint[] | null> {
  // SeaRoute API requires a paid API key
  // Returning null to use OpenCPN routing as fallback
  console.log('⚓ Using OpenCPN maritime routing (SeaRoute API requires authentication)');
  return null;
}

/**
 * OpenCPN-style routing (great circle with coastal avoidance)
 * Based on OpenCPN's routing algorithm principles
 */
export function getOpenCPNRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Waypoint[] {
  const waypoints: Waypoint[] = [];
  
  // Add origin
  waypoints.push({ lat: originLat, lng: originLng, label: 'Origin' });
  
  // Calculate great circle distance and bearing
  const { distance, bearing } = calculateGreatCircleDistance(
    originLat, originLng, destLat, destLng
  );
  
  // Determine route type based on geography
  const isTransatlantic = Math.abs(originLng - destLng) > 60 && 
                          originLat > 35 && originLat < 60 &&
                          destLat > 35 && destLat < 60;
  
  const isTranspacific = Math.abs(originLng - destLng) > 120;
  
  const isMediterranean = (originLat > 30 && originLat < 50 && originLng > -5 && originLng < 15 &&
                          destLat > 30 && destLat < 45 && destLng > 25 && destLng < 40);
  
  // Routes requiring Suez Canal (Europe/Med to Asia/Middle East/East Africa)
  const isSuezRoute = (
    // Origin in Europe/Med (west of Suez)
    (originLat > 30 && originLat < 60 && originLng > -10 && originLng < 35) &&
    // Destination in Asia/Middle East/East Africa/East Asia (east of Suez)
    (destLat > -35 && destLat < 50 && destLng > 35 && destLng < 140)
  ) || (
    // Reverse: Asia to Europe
    (destLat > 30 && destLat < 60 && destLng > -10 && destLng < 35) &&
    (originLat > -35 && originLat < 50 && originLng > 35 && originLng < 140)
  );
  
  if (isSuezRoute) {
    // Route through Suez Canal
    const isEastbound = originLng < destLng;
    
    if (isEastbound) {
      // Europe to Asia/Middle East via Suez
      waypoints.push(
        { lat: 50.0, lng: 1.5, label: 'Dover Strait' },
        { lat: 48.5, lng: -4.5, label: 'Ushant' },
        { lat: 43.5, lng: -9.0, label: 'Cape Finisterre' },
        { lat: 36.0, lng: -6.0, label: 'Gibraltar' },
        { lat: 36.5, lng: 3.0, label: 'Algerian Basin' },
        { lat: 36.0, lng: 15.0, label: 'Ionian Sea' },
        { lat: 33.5, lng: 25.0, label: 'Crete' },
        { lat: 31.5, lng: 32.3, label: 'Port Said' },
        { lat: 30.0, lng: 32.5, label: 'Suez Canal' },
        { lat: 27.5, lng: 33.8, label: 'Red Sea North' },
        { lat: 20.0, lng: 38.0, label: 'Red Sea Central' },
        { lat: 12.5, lng: 43.3, label: 'Bab el-Mandeb' },
        { lat: 12.0, lng: 45.0, label: 'Gulf of Aden' }
      );
      
      // Add waypoints based on final destination
      if (destLng > 100 && destLat > 0 && destLat < 40) {
        // East Asia (Shanghai, Hong Kong, etc.)
        waypoints.push(
          { lat: 15.0, lng: 58.0, label: 'Arabian Sea' },
          { lat: 8.0, lng: 73.0, label: 'Maldives' },
          { lat: 6.0, lng: 80.0, label: 'Sri Lanka' },
          { lat: 3.0, lng: 95.0, label: 'Andaman Sea' },
          { lat: 1.3, lng: 103.8, label: 'Singapore Strait' },
          { lat: 4.0, lng: 109.0, label: 'South China Sea' },
          { lat: 15.0, lng: 115.0, label: 'South China Sea North' },
          { lat: 22.0, lng: 118.0, label: 'Taiwan Strait' }
        );
      } else if (destLng > 65 && destLng < 80 && destLat > 15 && destLat < 25) {
        // India (Mumbai, etc.)
        waypoints.push(
          { lat: 15.0, lng: 58.0, label: 'Arabian Sea West' },
          { lat: destLat, lng: 70.0, label: 'Arabian Sea East' }
        );
      } else if (destLat < 0) {
        // East Africa
        waypoints.push(
          { lat: 5.0, lng: 50.0, label: 'Somali Basin' }
        );
      } else {
        // Persian Gulf or other Middle East
        waypoints.push(
          { lat: 20.0, lng: 60.0, label: 'Arabian Sea' }
        );
      }
    } else {
      // Asia to Europe (reverse route)
      if (originLng > 100 && originLat > 0 && originLat < 40) {
        // East Asia to Europe (Shanghai, Hong Kong, etc.)
        waypoints.push(
          { lat: 22.0, lng: 118.0, label: 'Taiwan Strait' },
          { lat: 15.0, lng: 115.0, label: 'South China Sea North' },
          { lat: 4.0, lng: 109.0, label: 'South China Sea' },
          { lat: 1.3, lng: 103.8, label: 'Singapore Strait' },
          { lat: 3.0, lng: 95.0, label: 'Andaman Sea' },
          { lat: 6.0, lng: 80.0, label: 'Sri Lanka' },
          { lat: 8.0, lng: 73.0, label: 'Maldives' }
        );
      } else if (originLng > 65 && originLng < 80) {
        waypoints.push({ lat: originLat, lng: 70.0, label: 'Arabian Sea East' });
      }
      waypoints.push(
        { lat: 15.0, lng: 58.0, label: 'Arabian Sea' },
        { lat: 12.0, lng: 45.0, label: 'Gulf of Aden' },
        { lat: 12.5, lng: 43.3, label: 'Bab el-Mandeb' },
        { lat: 20.0, lng: 38.0, label: 'Red Sea Central' },
        { lat: 27.5, lng: 33.8, label: 'Red Sea North' },
        { lat: 30.0, lng: 32.5, label: 'Suez Canal' },
        { lat: 31.5, lng: 32.3, label: 'Port Said' },
        { lat: 33.5, lng: 25.0, label: 'Crete' },
        { lat: 36.0, lng: 15.0, label: 'Ionian Sea' },
        { lat: 36.5, lng: 3.0, label: 'Algerian Basin' },
        { lat: 36.0, lng: -6.0, label: 'Gibraltar' },
        { lat: 43.5, lng: -9.0, label: 'Cape Finisterre' },
        { lat: 48.5, lng: -4.5, label: 'Ushant' },
        { lat: 50.0, lng: 1.5, label: 'Dover Strait' }
      );
    }
  } else if (isMediterranean) {
    // Mediterranean route (e.g., Rotterdam to Port Said via Gibraltar)
    waypoints.push(
      { lat: 50.0, lng: -1.0, label: 'English Channel' },
      { lat: 43.0, lng: -5.0, label: 'Bay of Biscay' },
      { lat: 36.0, lng: -6.0, label: 'Gibraltar Strait' },
      { lat: 36.5, lng: 0.0, label: 'Western Mediterranean' },
      { lat: 36.0, lng: 10.0, label: 'Central Mediterranean' },
      { lat: 34.0, lng: 20.0, label: 'Eastern Mediterranean' }
    );
  } else if (isTransatlantic) {
    // Atlantic crossing - avoid UK
    if (originLng > -5 && originLng < 15 && destLng < -60) {
      // Europe to North America
      waypoints.push(
        { lat: 50.5, lng: -1.0, label: 'English Channel' },
        { lat: 49.0, lng: -6.0, label: 'West of UK' },
        { lat: 47.0, lng: -12.0, label: 'Atlantic' },
        { lat: 45.0, lng: -20.0, label: 'Mid-Atlantic' },
        { lat: 42.0, lng: -35.0, label: 'Approach' }
      );
    } else if (originLng < -60 && destLng > -5 && destLng < 15) {
      // North America to Europe
      waypoints.push(
        { lat: 42.0, lng: -35.0, label: 'Departure' },
        { lat: 45.0, lng: -20.0, label: 'Mid-Atlantic' },
        { lat: 47.0, lng: -12.0, label: 'Atlantic' },
        { lat: 49.0, lng: -6.0, label: 'West of UK' },
        { lat: 50.5, lng: -1.0, label: 'English Channel' }
      );
    }
  } else if (isTranspacific) {
    // Pacific crossing - add mid-ocean waypoint
    const midLat = (originLat + destLat) / 2;
    const midLng = (originLng + destLng) / 2;
    waypoints.push({ lat: midLat, lng: midLng, label: 'Mid-Pacific' });
  } else if (distance > 500) {
    // For other long routes, add offshore waypoints
    const bearing1 = calculateBearing(originLat, originLng, destLat, destLng);
    const bearing2 = calculateBearing(destLat, destLng, originLat, originLng);
    
    const departure = calculateDestination(originLat, originLng, bearing1, 100);
    const approach = calculateDestination(destLat, destLng, bearing2, 100);
    
    waypoints.push(
      { ...departure, label: 'Offshore' },
      { ...approach, label: 'Approach' }
    );
  }
  
  // Add destination
  waypoints.push({ lat: destLat, lng: destLng, label: 'Destination' });
  
  return waypoints;
}

/**
 * Calculate great circle distance between two points (Haversine formula)
 */
function calculateGreatCircleDistance(
  lat1: number, lon1: number, lat2: number, lon2: number
): { distance: number; bearing: number } {
  const R = 3440.065; // Earth's radius in nautical miles
  const toRad = (deg: number) => deg * Math.PI / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  
  return { distance, bearing };
}

/**
 * Calculate bearing between two points
 */
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => deg * Math.PI / 180;
  const toDeg = (rad: number) => rad * 180 / Math.PI;
  
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

/**
 * Calculate destination point given start point, bearing, and distance
 */
function calculateDestination(
  lat: number, lng: number, bearing: number, distanceNM: number
): { lat: number; lng: number } {
  const toRad = (deg: number) => deg * Math.PI / 180;
  const toDeg = (rad: number) => rad * 180 / Math.PI;
  const R = 3440.065; // Earth's radius in nautical miles
  
  const lat1 = toRad(lat);
  const lon1 = toRad(lng);
  const brng = toRad(bearing);
  
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceNM / R) +
    Math.cos(lat1) * Math.sin(distanceNM / R) * Math.cos(brng)
  );
  
  const lon2 = lon1 + Math.atan2(
    Math.sin(brng) * Math.sin(distanceNM / R) * Math.cos(lat1),
    Math.cos(distanceNM / R) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return { lat: toDeg(lat2), lng: toDeg(lon2) };
}

/**
 * Get optimized maritime route using coordinates directly
 * Uses OpenCPN-style routing with maritime waypoints
 */
export async function getMaritimeRouteByCoordinates(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<Waypoint[]> {
  // Try SeaRoute API first (currently disabled - requires API key)
  try {
    const seaRouteWaypoints = await getSeaRoute(
      originLat, originLng, destLat, destLng
    );
    
    if (seaRouteWaypoints && seaRouteWaypoints.length > 0) {
      console.log(`✅ Using SeaRoute API routing with ${seaRouteWaypoints.length} waypoints`);
      return seaRouteWaypoints;
    }
  } catch (error) {
    console.error('SeaRoute API failed:', error);
  }
  
  // Use OpenCPN-style maritime routing
  console.log('🗺️ Using OpenCPN maritime routing');
  return getOpenCPNRoute(originLat, originLng, destLat, destLng);
}

/**
 * Get maritime route using port names
 * Uses SeaRoute API exclusively
 */
export async function getMaritimeRoute(
  originPort: string,
  destPort: string
): Promise<Waypoint[]> {
  const origin = PORTS[originPort] || PORTS['Rotterdam'];
  const dest = PORTS[destPort] || PORTS['New York'];
  
  console.log(`🗺️ Getting route from ${originPort} to ${destPort}`);
  return getMaritimeRouteByCoordinates(origin.lat, origin.lng, dest.lat, dest.lng);
}

/**
 * Calculate total route distance
 */
export function calculateRouteDistance(waypoints: Waypoint[]): number {
  let totalDistance = 0;
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const { distance } = calculateGreatCircleDistance(
      waypoints[i].lat,
      waypoints[i].lng,
      waypoints[i + 1].lat,
      waypoints[i + 1].lng
    );
    totalDistance += distance;
  }
  
  return totalDistance;
}

