import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

interface DistanceResult {
  distance: number;
  duration: number;
  status: string;
}

interface GoogleDistanceMatrixResponse {
  status: string;
  rows: Array<{
    elements: Array<{
      distance?: { value: number; text: string };
      duration?: { value: number; text: string };
      status: string;
    }>;
  }>;
}

@Injectable()
export class DistanceService {
  private readonly googleApiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  private readonly baseUrl =
    'https://maps.googleapis.com/maps/api/distancematrix/json';

  async calculateRoadDistance(
    originLat: number,
    originLng: number,
    destinyLat: number,
    destinyLng: number,
  ): Promise<DistanceResult> {
    try {
      if (!this.googleApiKey) {
        throw new HttpException(
          'Google Maps API key não configurada',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const origins = `${originLat},${originLng}`;
      const destinations = `${destinyLat},${destinyLng}`;

      const response = await axios.get<GoogleDistanceMatrixResponse>(
        this.baseUrl,
        {
          params: {
            origins,
            destinations,
            key: this.googleApiKey,
            units: 'metric',
            mode: 'driving',
            language: 'pt-BR',
            region: 'BR',
          },
          timeout: 10000,
        },
      );

      if (response.data.status !== 'OK') {
        throw new HttpException(
          `Erro na API do Google Maps: ${response.data.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const element = response.data.rows[0]?.elements[0];

      if (!element || element.status !== 'OK') {
        const distance = this.calculateHaversineDistance(
          originLat,
          originLng,
          destinyLat,
          destinyLng,
        );

        return {
          distance,
          duration: Math.round(distance / 60), // Estimativa: 60 km/h médio
          status: 'FALLBACK_HAVERSINE',
        };
      }

      return {
        distance: Math.round(element.distance.value / 1000), // metros para km
        duration: Math.round(element.duration.value / 60), // segundos para minutos
        status: 'OK',
      };
    } catch (error) {
      console.error('Erro ao calcular distância rodoviária:', error);

      // Fallback para cálculo haversine em caso de erro
      const distance = this.calculateHaversineDistance(
        originLat,
        originLng,
        destinyLat,
        destinyLng,
      );

      return {
        distance,
        duration: Math.round(distance / 60), // Estimativa: 60 km/h médio
        status: 'FALLBACK_HAVERSINE',
      };
    }
  }

  /**
   * Cálculo de distância usando fórmula Haversine (linha reta)
   * Usado como fallback quando a API do Google não está disponível
   */
  private calculateHaversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Raio da Terra em km

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

  /**
   * Busca drivers próximos usando distância rodoviária
   */
  async findNearbyDriversWithRoadDistance(
    originLat: number,
    originLng: number,
    drivers: any[],
    maxDistanceKm: number = 50,
  ): Promise<any[]> {
    const driversWithDistance = await Promise.all(
      drivers.map(async (driver) => {
        try {
          const distanceData = await this.calculateRoadDistance(
            originLat,
            originLng,
            Number(driver.locations.latitude),
            Number(driver.locations.longitude),
          );

          return {
            ...driver,
            roadDistance: distanceData.distance,
            estimatedDuration: distanceData.duration,
            distanceStatus: distanceData.status,
          };
        } catch (error) {
          console.error(
            `Erro ao calcular distância para driver ${driver.id}:`,
            error,
          );
          return null;
        }
      }),
    );

    return driversWithDistance
      .filter(
        (driver) => driver !== null && driver.roadDistance <= maxDistanceKm,
      )
      .sort((a, b) => a.roadDistance - b.roadDistance);
  }
}
