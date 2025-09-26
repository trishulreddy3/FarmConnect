import { Loader } from '@googlemaps/js-api-loader';

class MapsService {
  private loader: Loader;
  private map: google.maps.Map | null = null;
  private geocoder: google.maps.Geocoder | null = null;

  constructor() {
    this.loader = new Loader({
      apiKey: 'AIzaSyAxW47_2mF0wypG9Vff6fxc9w_kGhs9Ka8',
      version: 'weekly',
      libraries: ['places', 'geometry']
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.loader.load();
      this.geocoder = new google.maps.Geocoder();
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      throw error;
    }
  }

  async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          resolve(null);
        }
      );
    });
  }

  async getAddressFromCoordinates(lat: number, lng: number): Promise<string | null> {
    if (!this.geocoder) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      this.geocoder!.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    if (!this.geocoder) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      this.geocoder!.geocode(
        { address },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            resolve({
              lat: location.lat(),
              lng: location.lng()
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  formatDistance(distanceInKm: number): string {
    if (distanceInKm < 1) {
      return `${(distanceInKm * 1000).toFixed(0)} m`;
    } else {
      return `${distanceInKm.toFixed(1)} km`;
    }
  }
}

export const mapsService = new MapsService();

