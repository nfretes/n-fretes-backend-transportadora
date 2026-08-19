import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GeocodingService } from './geocoding.service';

@ApiTags('geocoding')
@Controller('geocoding')
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete de endereços' })
  @ApiQuery({ name: 'input', required: true, description: 'Texto para busca' })
  async autocomplete(
    @Query('input') input: string,
    @Query('region') region?: string,
    @Query('language') language?: string,
    @Query('country') country?: string,
    @Query('lat') latParam?: string,
    @Query('lng') lngParam?: string,
    @Query('radius') radiusParam?: string,
  ) {
    if (!input || input.trim().length === 0) {
      throw new HttpException('Parâmetro input é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const lat = latParam != null ? parseFloat(latParam) : undefined;
    const lng = lngParam != null ? parseFloat(lngParam) : undefined;
    const radius = radiusParam != null ? parseInt(radiusParam, 10) : undefined;

    return this.geocodingService.autocomplete({
      input: input.trim(),
      region,
      language,
      country,
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
      radius: Number.isFinite(radius) ? radius : undefined,
    });
  }

  @Get('place/:placeId')
  @ApiOperation({ summary: 'Busca coordenadas por placeId' })
  async getCoordinatesFromPlaceId(@Param('placeId') placeId: string) {
    if (!placeId || placeId.trim().length === 0) {
      throw new HttpException('placeId é obrigatório', HttpStatus.BAD_REQUEST);
    }

    return this.geocodingService.getCoordinatesFromPlaceId(placeId.trim());
  }

  @Get('distance')
  @ApiOperation({ summary: 'Calcula distância entre 2 coordenadas (Haversine)' })
  async getDistance(
    @Query('lat1') lat1Param: string,
    @Query('lng1') lng1Param: string,
    @Query('lat2') lat2Param: string,
    @Query('lng2') lng2Param: string,
  ) {
    const lat1 = parseFloat(lat1Param ?? '');
    const lng1 = parseFloat(lng1Param ?? '');
    const lat2 = parseFloat(lat2Param ?? '');
    const lng2 = parseFloat(lng2Param ?? '');

    if (
      !Number.isFinite(lat1) ||
      !Number.isFinite(lng1) ||
      !Number.isFinite(lat2) ||
      !Number.isFinite(lng2)
    ) {
      throw new HttpException(
        'lat1, lng1, lat2, lng2 são obrigatórios e devem ser números',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.geocodingService.getDistance(lat1, lng1, lat2, lng2);
  }

  @Post('geocode')
  @ApiOperation({ summary: 'Geocode de endereço para coordenadas' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        address: { type: 'string', example: 'Av. Paulista, 1000 - São Paulo' },
        region: { type: 'string', example: 'BR' },
        language: { type: 'string', example: 'pt-BR' },
      },
      required: ['address'],
    },
  })
  async geocode(@Body() body: any) {
    const address = body?.address;

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      throw new HttpException('address é obrigatório', HttpStatus.BAD_REQUEST);
    }

    return this.geocodingService.geocodeAddress({
      address: address.trim(),
      region: body?.region,
      language: body?.language,
    });
  }

  @Post('reverse-geocode')
  @ApiOperation({ summary: 'Reverse geocode de coordenadas para endereço' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        lat: { type: 'number', example: -23.561684 },
        lng: { type: 'number', example: -46.655981 },
        language: { type: 'string', example: 'pt-BR' },
        result_type: { type: 'string', example: 'street_address' },
      },
      required: ['lat', 'lng'],
    },
  })
  async reverseGeocode(@Body() body: any) {
    const lat = Number(body?.lat);
    const lng = Number(body?.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new HttpException(
        'lat e lng são obrigatórios e devem ser números',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.geocodingService.reverseGeocode({
      lat,
      lng,
      language: body?.language,
      result_type: body?.result_type,
    });
  }

  @Get('validate')
  @ApiOperation({ summary: 'Valida endereço' })
  async validateAddress(@Query('address') address: string) {
    if (!address || address.trim().length === 0) {
      throw new HttpException('Parâmetro address é obrigatório', HttpStatus.BAD_REQUEST);
    }

    return this.geocodingService.validateAddress(address.trim());
  }
}
