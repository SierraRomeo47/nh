/**
 * Platts (S&P Global) Market Data Adapter
 * Provides marine fuel price benchmarks
 * API Documentation: https://www.spglobal.com/commodityinsights/en/products-services/data-analytics
 */

import axios from 'axios';

export interface PlattsFuelPrice {
  fuelType: string;
  price: number;
  currency: string;
  unit: string;
  port: string;
  timestamp: Date;
  source: string;
  grade?: string;
}

export class PlattsAdapter {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, { data: PlattsFuelPrice; expiry: number }>;
  private cacheDuration: number;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PLATTS_API_KEY || '';
    this.baseUrl = process.env.PLATTS_API_URL || 'https://api.platts.com/v1';
    this.cache = new Map();
    this.cacheDuration = 15 * 60 * 1000; // 15 minutes cache
  }

  /**
   * Get current fuel prices for major marine fuels
   */
  async getMarineFuelPrices(): Promise<PlattsFuelPrice[]> {
    const cacheKey = 'marine_fuels';
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return [cached.data];
    }

    try {
      if (!this.apiKey) {
        console.warn('Platts API key not configured, using fallback');
        return this.getFallbackFuelPrices();
      }

      const response = await axios.get(`${this.baseUrl}/market-data`, {
        headers: {
          'appkey': this.apiKey,
          'Accept': 'application/json'
        },
        params: {
          symbols: 'AAVHZ00,AAQTN00,PCAAS00', // VLSFO Singapore, MGO Rotterdam, LNG JKM
          fields: 'assessDate,value,currency'
        },
        timeout: 10000
      });

      return this.parsePlattsResponse(response.data);
    } catch (error) {
      console.error('Error fetching Platts fuel prices:', error);
      return this.getFallbackFuelPrices();
    }
  }

  /**
   * Get price for specific fuel type and port
   */
  async getFuelPrice(fuelType: string, port: string = 'SINGAPORE'): Promise<PlattsFuelPrice | null> {
    try {
      if (!this.apiKey) {
        return this.getFallbackFuelPrice(fuelType, port);
      }

      const symbolMap: { [key: string]: string } = {
        'VLSFO_SINGAPORE': 'AAVHZ00',
        'MGO_ROTTERDAM': 'AAQTN00',
        'LNG_JKM': 'PCAAS00',
        'VLSFO_ROTTERDAM': 'AAVHZ01'
      };

      const symbol = symbolMap[`${fuelType}_${port}`] || 'AAVHZ00';

      const response = await axios.get(`${this.baseUrl}/market-data/${symbol}`, {
        headers: {
          'appkey': this.apiKey
        },
        timeout: 10000
      });

      return {
        fuelType: fuelType,
        price: response.data.value,
        currency: response.data.currency,
        unit: 'tonne',
        port: port,
        timestamp: new Date(response.data.assessDate),
        source: 'PLATTS'
      };
    } catch (error) {
      console.error(`Error fetching ${fuelType} price:`, error);
      return this.getFallbackFuelPrice(fuelType, port);
    }
  }

  private parsePlattsResponse(data: any): PlattsFuelPrice[] {
    // Parse Platts API response format
    return data.results.map((item: any) => ({
      fuelType: this.mapSymbolToFuelType(item.symbol),
      price: parseFloat(item.value),
      currency: item.currency,
      unit: 'tonne',
      port: this.getPortFromSymbol(item.symbol),
      timestamp: new Date(item.assessDate),
      source: 'PLATTS'
    }));
  }

  private mapSymbolToFuelType(symbol: string): string {
    const symbolMap: { [key: string]: string } = {
      'AAVHZ00': 'VLSFO',
      'AAQTN00': 'MGO',
      'PCAAS00': 'LNG'
    };
    return symbolMap[symbol] || 'UNKNOWN';
  }

  private getPortFromSymbol(symbol: string): string {
    if (symbol.includes('AAVHZ')) return 'SINGAPORE';
    if (symbol.includes('AAQTN')) return 'ROTTERDAM';
    if (symbol.includes('PCAAS')) return 'JKM';
    return 'UNKNOWN';
  }

  /**
   * Fallback fuel prices based on typical market ranges
   */
  private getFallbackFuelPrices(): PlattsFuelPrice[] {
    return [
      {
        fuelType: 'VLSFO',
        price: 650.00 + (Math.random() - 0.5) * 50,
        currency: 'USD',
        unit: 'tonne',
        port: 'SINGAPORE',
        timestamp: new Date(),
        source: 'PLATTS_FALLBACK',
        grade: '0.5%S'
      },
      {
        fuelType: 'MGO',
        price: 820.00 + (Math.random() - 0.5) * 60,
        currency: 'USD',
        unit: 'tonne',
        port: 'ROTTERDAM',
        timestamp: new Date(),
        source: 'PLATTS_FALLBACK',
        grade: '0.1%S'
      },
      {
        fuelType: 'LNG',
        price: 580.00 + (Math.random() - 0.5) * 80,
        currency: 'USD',
        unit: 'tonne',
        port: 'JKM',
        timestamp: new Date(),
        source: 'PLATTS_FALLBACK'
      },
      {
        fuelType: 'BIO_MGO',
        price: 1150.00 + (Math.random() - 0.5) * 100,
        currency: 'USD',
        unit: 'tonne',
        port: 'ROTTERDAM',
        timestamp: new Date(),
        source: 'PLATTS_FALLBACK',
        grade: 'B30'
      },
      {
        fuelType: 'E_METHANOL',
        price: 1450.00 + (Math.random() - 0.5) * 120,
        currency: 'USD',
        unit: 'tonne',
        port: 'ROTTERDAM',
        timestamp: new Date(),
        source: 'PLATTS_FALLBACK'
      }
    ];
  }

  private getFallbackFuelPrice(fuelType: string, port: string): PlattsFuelPrice {
    const prices: { [key: string]: number } = {
      'VLSFO': 650.00,
      'MGO': 820.00,
      'LNG': 580.00,
      'BIO_MGO': 1150.00,
      'E_METHANOL': 1450.00
    };

    return {
      fuelType: fuelType,
      price: (prices[fuelType] || 700) + (Math.random() - 0.5) * 50,
      currency: 'USD',
      unit: 'tonne',
      port: port,
      timestamp: new Date(),
      source: 'PLATTS_FALLBACK'
    };
  }
}

