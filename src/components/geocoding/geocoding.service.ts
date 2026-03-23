import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';

interface GoogleGeocodingResult {
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  place_id: string;
  types: string[];
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

interface GoogleGeocodingResponse {
  results: GoogleGeocodingResult[];
  status: string;
}

interface GoogleAutocompletePrediction {
  description: string;
  place_id: string;
  types: string[];
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GoogleAutocompleteResponse {
  predictions: GoogleAutocompletePrediction[];
  status: string;
}

@Injectable()
export class GeocodingService {
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api';

  private getApiKey(): string {
    const key =
      process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

    if (!key) {
      throw new HttpException(
        'GOOGLE_MAPS_SERVER_API_KEY (ou GOOGLE_MAPS_API_KEY) não configurada',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return key;
  }

  async autocomplete(params: {
    input: string;
    region?: string;
    language?: string;
    country?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }) {
    try {
      const key = this.getApiKey();
      const country = params.country ?? 'BR';

      const search = new URLSearchParams({
        input: params.input,
        key,
        region: params.region || country || 'BR',
        language: params.language || 'pt-BR',
      });

      if (country) {
        search.set('components', `country:${country}`);
      }

      if (params.lat != null && params.lng != null) {
        search.set('location', `${params.lat},${params.lng}`);
        search.set('radius', String(params.radius ?? 50000));
      }

      const response = await axios.get<GoogleAutocompleteResponse>(
        `${this.baseUrl}/place/autocomplete/json?${search.toString()}`,
      );

      const data = response.data;

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new HttpException(
          `Autocomplete falhou: ${data.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const predictions = data.predictions ?? [];

      return {
        success: true as const,
        predictions: predictions.map((p) => ({
          description: p.description,
          place_id: p.place_id,
          types: p.types,
          main_text: p.structured_formatting?.main_text ?? p.description,
          secondary_text: p.structured_formatting?.secondary_text ?? '',
        })),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Erro no autocomplete',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getCoordinatesFromPlaceId(placeId: string) {
    try {
      const key = this.getApiKey();
      const search = new URLSearchParams({
        place_id: placeId,
        fields: 'geometry,formatted_address,place_id,types,address_components',
        key,
        language: 'pt-BR',
      });

      const response = await axios.get<{
        status: string;
        result?: GoogleGeocodingResult;
      }>(`${this.baseUrl}/place/details/json?${search.toString()}`);

      const data = response.data;

      if (data.status !== 'OK') {
        throw new HttpException(
          `Não foi possível obter detalhes do lugar: ${data.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = data.result;

      if (!result?.geometry) {
        throw new HttpException(
          'placeId não retornou coordenadas válidas',
          HttpStatus.BAD_REQUEST,
        );
      }

      const location = result.geometry.location;

      return {
        success: true as const,
        place_id: placeId,
        address: result.formatted_address ?? '',
        coordinates: { lat: location.lat, lng: location.lng },
        types: result.types ?? [],
        address_components: result.address_components ?? [],
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Erro ao obter coordenadas',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async geocodeAddress(params: {
    address: string;
    region?: string;
    language?: string;
  }) {
    try {
      const key = this.getApiKey();

      const search = new URLSearchParams({
        address: params.address,
        key,
        region: params.region || 'BR',
        language: params.language || 'pt-BR',
        components: 'country:BR',
      });

      const response = await axios.get<GoogleGeocodingResponse>(
        `${this.baseUrl}/geocode/json?${search.toString()}`,
      );

      const data = response.data;

      if (data.status !== 'OK') {
        throw new HttpException(
          `Não foi possível geocodificar o endereço: ${data.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!data.results?.length) {
        throw new HttpException('Endereço não encontrado', HttpStatus.NOT_FOUND);
      }

      const result = data.results[0];
      const location = result.geometry.location;

      return {
        success: true as const,
        address: result.formatted_address,
        coordinates: { lat: location.lat, lng: location.lng },
        place_id: result.place_id,
        types: result.types,
        address_components: result.address_components,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException('Erro no geocoding', HttpStatus.BAD_REQUEST);
    }
  }

  async reverseGeocode(params: {
    lat: number;
    lng: number;
    language?: string;
    result_type?: string;
  }) {
    try {
      const key = this.getApiKey();

      const search = new URLSearchParams({
        latlng: `${params.lat},${params.lng}`,
        key,
        language: params.language || 'pt-BR',
      });

      if (params.result_type) {
        search.set('result_type', params.result_type);
      }

      const response = await axios.get<GoogleGeocodingResponse>(
        `${this.baseUrl}/geocode/json?${search.toString()}`,
      );

      const data = response.data;

      if (data.status !== 'OK') {
        throw new HttpException(
          `Não foi possível fazer reverse geocoding: ${data.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!data.results?.length) {
        throw new HttpException(
          'Coordenadas não retornaram resultados',
          HttpStatus.NOT_FOUND,
        );
      }

      const result = data.results[0];

      return {
        success: true as const,
        address: result.formatted_address,
        coordinates: { lat: params.lat, lng: params.lng },
        place_id: result.place_id,
        types: result.types,
        address_components: result.address_components,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Erro no reverse geocoding',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async validateAddress(address: string) {
    try {
      const result = await this.geocodeAddress({ address });

      return {
        success: true as const,
        valid: true as const,
        address: result.address,
        coordinates: result.coordinates,
      };
    } catch (error) {
      return {
        success: true as const,
        valid: false as const,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

    return R * c;
  }

  getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const distance = this.calculateDistance(lat1, lng1, lat2, lng2);

    return {
      success: true as const,
      distance: Math.round(distance * 100) / 100,
      unit: 'km' as const,
    };
  }
}
