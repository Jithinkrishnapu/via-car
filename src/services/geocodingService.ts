import * as Location from 'expo-location';

interface GeocodeResult {
  address: string;
  success: boolean;
}

class GeocodingService {
  private static instance: GeocodingService;
  private lastRequestTime = 0;
  private cache = new Map<string, string>();
  private readonly RATE_LIMIT_MS = 1000; // 1 second between requests
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

  static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  private getCacheKey(lat: number, lng: number): string {
    return `${lat.toFixed(4)},${lng.toFixed(4)}`;
  }

  private getFallbackAddress(lat: number, lng: number): string {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult> {
    const cacheKey = this.getCacheKey(latitude, longitude);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return {
        address: this.cache.get(cacheKey)!,
        success: true
      };
    }

    // Rate limiting check
    const now = Date.now();
    if (now - this.lastRequestTime < this.RATE_LIMIT_MS) {
      console.log('GeocodingService: Rate limit hit, using fallback');
      return {
        address: this.getFallbackAddress(latitude, longitude),
        success: false
      };
    }

    try {
      this.lastRequestTime = now;
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      let formattedAddress = '';
      if (place) {
        const { city, region, district, street, streetNumber, postalCode } = place;
        formattedAddress = [
          street && streetNumber ? `${streetNumber} ${street}` : '',
          district || '',
          city || '',
          region || '',
          postalCode || '',
        ]
          .filter(Boolean)
          .join(', ');
      }

      const finalAddress = formattedAddress || this.getFallbackAddress(latitude, longitude);
      
      // Cache the result
      this.cache.set(cacheKey, finalAddress);
      
      // Clean old cache entries periodically
      if (this.cache.size > 100) {
        this.cleanCache();
      }

      return {
        address: finalAddress,
        success: true
      };
    } catch (error) {
      console.warn('GeocodingService: Reverse geocoding failed:', error);
      return {
        address: this.getFallbackAddress(latitude, longitude),
        success: false
      };
    }
  }

  private cleanCache(): void {
    // Simple cache cleanup - remove half of the entries
    const entries = Array.from(this.cache.entries());
    const toKeep = entries.slice(-50); // Keep last 50 entries
    this.cache.clear();
    toKeep.forEach(([key, value]) => this.cache.set(key, value));
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const geocodingService = GeocodingService.getInstance();