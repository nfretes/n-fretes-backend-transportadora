import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

interface CityDistanceResult {
  distance: number; // em km
  duration: number; // em minutos
  status: string;
  originLatitude?: string;
  originLongitude?: string;
  destinyLatitude?: string;
  destinyLongitude?: string;
}

interface GoogleGeocodingResponse {
  status: string;
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
  }>;
}

@Injectable()
export class CityDistanceService {
  private readonly googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
  private readonly geocodingUrl =
    'https://maps.googleapis.com/maps/api/geocode/json';
  private readonly distanceMatrixUrl =
    'https://maps.googleapis.com/maps/api/distancematrix/json';

  async calculateDistanceBetweenCities(
    originCity: string,
    originState: string,
    destinyCity: string,
    destinyState: string,
  ): Promise<CityDistanceResult> {
    try {
      if (!this.googleApiKey) {
        throw new HttpException(
          'Google Maps API key não configurada',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const origin = `${originCity}, ${originState}, Brasil`;
      const destination = `${destinyCity}, ${destinyState}, Brasil`;

      // Buscar coordenadas das cidades
      const [originCoords, destCoords] = await Promise.all([
        this.geocodeCity(origin),
        this.geocodeCity(destination),
      ]);

      const response = await axios.get(this.distanceMatrixUrl, {
        params: {
          origins: origin,
          destinations: destination,
          key: this.googleApiKey,
          units: 'metric',
          mode: 'driving',
          language: 'pt-BR',
          region: 'BR',
        },
        timeout: 10000,
      });

      if (response.data.status !== 'OK') {
        throw new HttpException(
          `Erro na API do Google Maps: ${response.data.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const element = response.data.rows[0]?.elements[0];

      if (!element || element.status !== 'OK') {
        return await this.fallbackDistanceCalculation(origin, destination);
      }

      return {
        distance: Math.round(element.distance.value / 1000),
        duration: Math.round(element.duration.value / 60),
        status: 'OK',
        originLatitude: originCoords?.lat?.toString(),
        originLongitude: originCoords?.lng?.toString(),
        destinyLatitude: destCoords?.lat?.toString(),
        destinyLongitude: destCoords?.lng?.toString(),
      };
    } catch (error) {
      console.error('Erro ao calcular distância entre cidades:', error);

      return await this.fallbackDistanceCalculation(
        `${originCity}, ${originState}, Brasil`,
        `${destinyCity}, ${destinyState}, Brasil`,
      );
    }
  }

  private async fallbackDistanceCalculation(
    origin: string,
    destination: string,
  ): Promise<CityDistanceResult> {
    try {
      // Geocodificar origem
      const originCoords = await this.geocodeCity(origin);
      const destCoords = await this.geocodeCity(destination);

      if (!originCoords || !destCoords) {
        return {
          distance: 500,
          duration: 360,
          status: 'FALLBACK_ESTIMATE',
          originLatitude: undefined,
          originLongitude: undefined,
          destinyLatitude: undefined,
          destinyLongitude: undefined,
        };
      }

      const distance = this.calculateHaversineDistance(
        originCoords.lat,
        originCoords.lng,
        destCoords.lat,
        destCoords.lng,
      );

      return {
        distance,
        duration: Math.round(distance / 60),
        status: 'FALLBACK_HAVERSINE',
        originLatitude: originCoords.lat.toString(),
        originLongitude: originCoords.lng.toString(),
        destinyLatitude: destCoords.lat.toString(),
        destinyLongitude: destCoords.lng.toString(),
      };
    } catch (error) {
      console.error('Erro no fallback de cálculo de distância:', error);

      return {
        distance: 500,
        duration: 360,
        status: 'ERROR_FALLBACK',
        originLatitude: undefined,
        originLongitude: undefined,
        destinyLatitude: undefined,
        destinyLongitude: undefined,
      };
    }
  }

  private async geocodeCity(
    cityQuery: string,
  ): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await axios.get<GoogleGeocodingResponse>(
        this.geocodingUrl,
        {
          params: {
            address: cityQuery,
            key: this.googleApiKey,
            language: 'pt-BR',
            region: 'BR',
          },
          timeout: 8000,
        },
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
        };
      }

      return null;
    } catch (error) {
      console.error(`Erro ao geocodificar cidade "${cityQuery}":`, error);
      return null;
    }
  }

  private calculateHaversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;

    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
