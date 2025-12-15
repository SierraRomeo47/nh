// Searoute API Service for maritime distance calculations
// Uses Haversine formula with maritime correction factor

interface RouteResult {
  distance: number; // nautical miles
  duration: number; // hours
}

class SearchrouteService {
  /**
   * Calculate maritime distance between two ports
   * @param fromLat - Origin port latitude
   * @param fromLon - Origin port longitude
   * @param toLat - Destination port latitude
   * @param toLon - Destination port longitude
   * @returns Distance in nautical miles and estimated duration
   */
  async calculateDistance(
    fromLat: number,
    fromLon: number,
    toLat: number,
    toLon: number
  ): Promise<RouteResult> {
    try {
      // Calculate great circle distance using Haversine formula
      const distance = this.calculateHaversineDistance(fromLat, fromLon, toLat, toLon);
      
      // Apply maritime correction factor (accounts for routing around landmasses, weather, ECA zones)
      // Typical corrections: 10-20% longer than great circle
      const maritimeDistance = distance * 1.15;
      
      return {
        distance: Math.round(maritimeDistance),
        duration: Math.round(maritimeDistance / 14) // Assuming 14 knots average speed
      };
    } catch (error) {
      console.error('Error calculating route:', error);
      throw error;
    }
  }

  /**
   * Calculate great circle distance using Haversine formula
   */
  private calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 3440.065; // Earth's radius in nautical miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate ballast leg distance
   * Ballast voyage is typically the return voyage or repositioning voyage
   * @param ladenDistance - Laden voyage distance in NM
   * @param estimatePct - Percentage of laden distance (default 30%)
   * @returns Ballast distance in nautical miles
   */
  calculateBallastDistance(
    ladenDistance: number,
    estimatePct: number = 30
  ): number {
    return Math.round(ladenDistance * (estimatePct / 100));
  }
}

export const searouteService = new SearchrouteService();
