import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteCache } from '@entities/route-cache.entity';
import { CreateUpdateRouteCacheDto } from './dto/create-update-route-cache.dto';
import { RouteCacheResponseDto, SaveRouteCacheResponseDto } from './dto/route-cache-response.dto';
import { QualpService, CalculateTollParams } from './qualp.service';
import { CalculateRouteDto } from './dto/calculate-route.dto';

@Injectable()
export class RouteCacheService {

  private readonly logger = new Logger(RouteCacheService.name);
  private readonly CACHE_VALIDITY_DAYS = 20;

  constructor(
    @InjectRepository(RouteCache)
    private readonly routeCacheRepository: Repository<RouteCache>,
    private readonly qualpService: QualpService,
  ) {}

  /**
   * Busca dados de rota em cache
   * Valida se o cache tem menos de 20 dias
   * Retorna null se não encontrar ou se estiver expirado
   */
  async getRouteCache(
    originCity: string,
    destinationCity: string,
  ): Promise<RouteCacheResponseDto | null> {

    const cachedRoute = await this.routeCacheRepository.findOne({
      where: {
        originCity,
        destinationCity,
      },
      order: {
        createdAt: 'DESC', 
      },
    });

    if (!cachedRoute) {
      return null;
    }

    const isValid = this.isCacheValid(cachedRoute.createdAt);

    if (!isValid) {
      return null; 
    }

    return {
      id: cachedRoute.id,
      success: true,
      tolls: cachedRoute.tolls,
      totalToll: Number(cachedRoute.totalToll),
      distance: cachedRoute.distance,
      distanceText: cachedRoute.distanceText,
      duration: cachedRoute.duration,
      fuelConsumption: Number(cachedRoute.fuelConsumption),
      coordinates: cachedRoute.coordinates,
      cachedAt: cachedRoute.createdAt,
      isValid: true,
    };
  }

  /**
   * Salva ou atualiza dados de rota em cache
   * Se já existir um cache para a rota, atualiza
   * Se não existir, cria um novo
   */
  async saveOrUpdateRouteCache(
    data: CreateUpdateRouteCacheDto,
  ): Promise<SaveRouteCacheResponseDto> {
    // Buscar cache existente
    const existingCache = await this.routeCacheRepository.findOne({
      where: {
        originCity: data.originCity,
        destinationCity: data.destinationCity,
      },
    });

    let savedCache: RouteCache;

    if (existingCache) {
   
      Object.assign(existingCache, {
        tolls: data.tolls,
        totalToll: data.totalToll,
        distance: data.distance,
        distanceText: data.distanceText,
        duration: data.duration,
        fuelConsumption: data.fuelConsumption,
        coordinates: data.coordinates,
        isValid: true,
      });

      savedCache = await this.routeCacheRepository.save(existingCache);
    } else {
    
      const newCache = this.routeCacheRepository.create({
        originCity: data.originCity,
        destinationCity: data.destinationCity,
        tolls: data.tolls,
        totalToll: data.totalToll,
        distance: data.distance,
        distanceText: data.distanceText,
        duration: data.duration,
        fuelConsumption: data.fuelConsumption,
        coordinates: data.coordinates,
        isValid: true,
      });

      savedCache = await this.routeCacheRepository.save(newCache);
    }

    return {
      success: true,
      message: existingCache
        ? 'Dados de rota atualizados com sucesso'
        : 'Dados de rota salvos com sucesso',
      id: savedCache.id,
    };
  }

  /**
   * Retorna cache válido ou chama a API QUALP e persiste o resultado.
   * Fluxo: busca no DB → se válido retorna; caso contrário chama QUALP → salva → retorna.
   */
  async calculateOrGetCached(
    dto: CalculateRouteDto,
  ): Promise<RouteCacheResponseDto> {
    const cached = await this.getRouteCache(dto.originCity, dto.destinationCity);
    if (cached) {
      this.logger.log(`Cache hit: ${dto.originCity} → ${dto.destinationCity}`);
      return cached;
    }

    this.logger.log(`Cache miss: chamando QUALP para ${dto.originCity} → ${dto.destinationCity}`);

    const params: CalculateTollParams = {
      locations: [dto.originCity, dto.destinationCity],
      axis: dto.axis,
      fuelPrice: dto.fuelPrice,
      kmPerLiter: dto.kmPerLiter,
      routeType: dto.routeType,
    };

    const result = await this.qualpService.calculateToll(params);

    const saved = await this.saveOrUpdateRouteCache({
      originCity: dto.originCity,
      destinationCity: dto.destinationCity,
      tolls: result.tolls.map((t) => ({ ...t, km: String(t.km) })),
      totalToll: result.totalToll,
      distance: result.distance,
      distanceText: result.distanceText,
      duration: result.duration,
      fuelConsumption: result.fuelConsumption,
      coordinates: result.coordinates as any,
    });

    return {
      id: saved.id,
      success: true,
      tolls: result.tolls.map((t) => ({ ...t, km: String(t.km) })),
      totalToll: result.totalToll,
      distance: result.distance,
      distanceText: result.distanceText,
      duration: result.duration,
      fuelConsumption: result.fuelConsumption,
      coordinates: result.coordinates as any,
      isValid: true,
    };
  }

  /**
   * Verifica se o cache ainda é válido (menos de 20 dias)
   */
  private isCacheValid(createdAt: Date): boolean {
    const now = new Date();
    const cacheDate = new Date(createdAt);
    const diffInMs = now.getTime() - cacheDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    return diffInDays <= this.CACHE_VALIDITY_DAYS;
  }

  /**
   * Limpa caches expirados (pode ser chamado via CRON)
   */
  async cleanExpiredCaches(): Promise<number> {
    const expirationDate = new Date();
    expirationDate.setDate(
      expirationDate.getDate() - this.CACHE_VALIDITY_DAYS,
    );

    const result = await this.routeCacheRepository
      .createQueryBuilder()
      .delete()
      .where('"createdAt" < :expirationDate', { expirationDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Lista todos os caches (para debug/admin)
   */
  async listAllCaches(limit: number = 50): Promise<RouteCache[]> {
    return this.routeCacheRepository.find({
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
