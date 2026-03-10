import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Freight } from '@entities/freight.entity';
import { FreightRequest } from '@entities/freight-requests.entity';
import { FreightRoutes, RouteStatus } from '@entities/freight-routes.entity';

@Injectable()
export class CompanyOverviewService {
  constructor(
    @InjectRepository(Freight)
    private freightRepository: Repository<Freight>,

    @InjectRepository(FreightRequest)
    private freightRequestRepository: Repository<FreightRequest>,

    @InjectRepository(FreightRoutes)
    private freightRoutesRepository: Repository<FreightRoutes>,
  ) {}

  private parseBRDate(dateStr: string): Date {
    const [day, month, year] = dateStr.trim().split('/');
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }

  private buildDateFilter(
    startDate?: string,
    endDate?: string,
  ): { start: Date; end: Date } | null {
    if (!startDate && !endDate) return null;
    const start = startDate
      ? this.parseBRDate(startDate)
      : new Date('2000-01-01');
    const end = endDate ? this.parseBRDate(endDate) : new Date();
    end.setUTCHours(23, 59, 59, 999);
    return { start, end };
  }

  async getCompanyStats(
    companyId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    try {
      const dateRange = this.buildDateFilter(startDate, endDate);

      const createdAtFilter = dateRange
        ? Between(dateRange.start, dateRange.end)
        : undefined;

      const startedAtFilter = dateRange
        ? Between(dateRange.start, dateRange.end)
        : undefined;

      const [
        publishedFreights,
        totalSolicitations,
        freightsInRoute,
        deliveriesCompleted,
        solicitationsByStatus,
      ] = await Promise.all([
        this.freightRepository.findAndCount({
          where: {
            companyId,
            isActive: true,
            openSolicitations: true,
            isExclude: false,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
          },
          order: { createdAt: 'DESC' },
        }),

        this.freightRequestRepository.count({
          where: {
            companyId,
            ...(createdAtFilter && { createdAt: createdAtFilter }),
          },
        }),

        this.freightRoutesRepository.count({
          where: {
            companyId,
            status: RouteStatus.IN_PROGRESS,
            ...(startedAtFilter && { startedAt: startedAtFilter }),
          },
        }),

        this.freightRoutesRepository.count({
          where: {
            companyId,
            status: RouteStatus.COMPLETED,
            ...(startedAtFilter && { startedAt: startedAtFilter }),
          },
        }),

        this.freightRequestRepository
          .createQueryBuilder('fr')
          .select('fr.status', 'status')
          .addSelect('COUNT(fr.id)', 'count')
          .where('fr.companyId = :companyId', { companyId })
          .andWhere(
            dateRange ? 'fr.createdAt BETWEEN :start AND :end' : '1=1',
            dateRange ? { start: dateRange.start, end: dateRange.end } : {},
          )
          .groupBy('fr.status')
          .getRawMany(),
      ]);

      return {
        period: dateRange ? { startDate, endDate } : null,
        publishedFreights: {
          count: publishedFreights[1],
          data: publishedFreights[0],
        },
        solicitations: {
          total: totalSolicitations,
          byStatus: solicitationsByStatus.map((s) => ({
            status: s.status,
            count: Number(s.count),
          })),
        },
        routes: {
          inProgress: freightsInRoute,
          completed: deliveriesCompleted,
        },
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar estatísticas da empresa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFreightsByDay(companyId: string): Promise<any> {
    try {
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(now);
      end.setUTCHours(23, 59, 59, 999);

      const rows = await this.freightRepository
        .createQueryBuilder('freight')
        .select(`TO_CHAR(freight."createdAt", 'DD/MM/YYYY')`, 'day')
        .addSelect('COUNT(freight.id)', 'count')
        .where('freight.companyId = :companyId', { companyId })
        .andWhere('freight.isExclude = false')
        .andWhere('freight."createdAt" BETWEEN :start AND :end', { start, end })
        .groupBy(`TO_CHAR(freight."createdAt", 'DD/MM/YYYY')`)
        .orderBy(`TO_CHAR(freight."createdAt", 'DD/MM/YYYY')`, 'ASC')
        .getRawMany();

      return {
        period: {
          startDate: start.toLocaleDateString('pt-BR'),
          endDate: end.toLocaleDateString('pt-BR'),
        },
        data: rows.map((r) => ({
          day: r.day,
          count: Number(r.count),
        })),
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar fretes por dia',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMetrics(
    companyId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    try {
      const dateRange = this.buildDateFilter(startDate, endDate);
      const start = dateRange?.start;
      const end = dateRange?.end;
      const dateParams = dateRange ? { start, end } : {};

      const [
        totalFreights,
        totalValueResult,
        acceptanceResult,
        leadTimeResult,
        onTimeResult,
      ] = await Promise.all([

        this.freightRepository.count({
          where: {
            companyId,
            isExclude: false,
            ...(dateRange && { createdAt: Between(start, end) }),
          },
        }),


        this.freightRepository
          .createQueryBuilder('f')
          .select('SUM(f."Valuefreight")', 'totalFreightValue')
          .addSelect('SUM(f."valueAdvance")', 'totalAdvance')
          .where('f.companyId = :companyId', { companyId })
          .andWhere('f.isExclude = false')
          .andWhere(
            dateRange ? 'f."createdAt" BETWEEN :start AND :end' : '1=1',
            dateParams,
          )
          .getRawOne(),

      
        this.freightRequestRepository
          .createQueryBuilder('fr')
          .select('COUNT(fr.id)', 'total')
          .addSelect(
            `COUNT(CASE WHEN fr.status = 'ACCEPTED' THEN 1 END)`,
            'accepted',
          )
          .where('fr.companyId = :companyId', { companyId })
          .andWhere(
            dateRange ? 'fr."createdAt" BETWEEN :start AND :end' : '1=1',
            dateParams,
          )
          .getRawOne(),

        this.freightRepository.manager.query(
          `
          SELECT AVG(
            EXTRACT(EPOCH FROM (first_req.first_request_at - f."createdAt")) / 3600
          ) AS avg_lead_time_hours
          FROM freight f
          INNER JOIN (
            SELECT "freightId", MIN("createdAt") AS first_request_at
            FROM freight_requests
            GROUP BY "freightId"
          ) first_req ON first_req."freightId" = f.id
          WHERE f."companyId" = $1
            AND f."isExclude" = false
            ${dateRange ? 'AND f."createdAt" BETWEEN $2 AND $3' : ''}
          `,
          dateRange ? [companyId, start, end] : [companyId],
        ),

    
        this.freightRepository.manager.query(
          `
          SELECT
            COUNT(fr.id) AS total_deliveries,
            COUNT(CASE WHEN fr."completedAt" <= f."dateReceiver" THEN 1 END) AS on_time
          FROM freight_routes fr
          INNER JOIN freight f ON f.id = fr."freightId"
          WHERE fr."companyId" = $1
            AND fr.status = 'COMPLETED'
            AND f."dateReceiver" IS NOT NULL
            ${dateRange ? 'AND fr."startedAt" BETWEEN $2 AND $3' : ''}
          `,
          dateRange ? [companyId, start, end] : [companyId],
        ),
      ]);

      const totalDeliveries = Number(onTimeResult[0]?.total_deliveries ?? 0);
      const onTime = Number(onTimeResult[0]?.on_time ?? 0);
      const totalRequests = Number(acceptanceResult?.total ?? 0);
      const accepted = Number(acceptanceResult?.accepted ?? 0);

      return {
        period: dateRange ? { startDate, endDate } : null,
        totalFreights,
        totalValue: {
          freightValue: Number(totalValueResult?.totalFreightValue ?? 0),
          advanceValue: Number(totalValueResult?.totalAdvance ?? 0),
          total:
            Number(totalValueResult?.totalFreightValue ?? 0) +
            Number(totalValueResult?.totalAdvance ?? 0),
        },
        acceptanceRate: {
          total: totalRequests,
          accepted,
          rate:
            totalRequests > 0
              ? Number(((accepted / totalRequests) * 100).toFixed(2))
              : 0,
        },
        leadTime: {
          avgHours: Number(
            Number(leadTimeResult[0]?.avg_lead_time_hours ?? 0).toFixed(2),
          ),
          avgDays: Number(
            (
              Number(leadTimeResult[0]?.avg_lead_time_hours ?? 0) / 24
            ).toFixed(2),
          ),
        },
        onTimeDelivery: {
          total: totalDeliveries,
          onTime,
          late: totalDeliveries - onTime,
          rate:
            totalDeliveries > 0
              ? Number(((onTime / totalDeliveries) * 100).toFixed(2))
              : 0,
        },
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar métricas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private formatTime(row: any, field = 'avg_hours') {
    const avg = Number(row?.[field] ?? 0);
    const median = Number(row?.median_hours ?? 0);
    const min = Number(row?.min_hours ?? 0);
    const max = Number(row?.max_hours ?? 0);
    return {
      avgHours: Number(avg.toFixed(2)),
      avgDays: Number((avg / 24).toFixed(2)),
      medianHours: Number(median.toFixed(2)),
      minHours: Number(min.toFixed(2)),
      maxHours: Number(max.toFixed(2)),
    };
  }

  async getKpis(
    companyId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    try {
      const dateRange = this.buildDateFilter(startDate, endDate);
      const dateRouteFilter = dateRange
        ? 'AND fr."startedAt" BETWEEN $2 AND $3'
        : '';
      const dateFreightFilter = dateRange
        ? 'AND f."createdAt" BETWEEN $2 AND $3'
        : '';
      const params = (extra: any[]) =>
        dateRange ? [companyId, dateRange.start, dateRange.end, ...extra] : [companyId, ...extra];

      const [deliveryResult, idleResult] = await Promise.all([
        this.freightRepository.manager.query(
          `
          SELECT
            COUNT(fr.id)                                                                  AS total_deliveries,
            COUNT(CASE WHEN fr."completedAt" <= f."dateReceiver" THEN 1 END)              AS on_time,
            COUNT(CASE WHEN fr."completedAt" > f."dateReceiver" THEN 1 END)               AS late,
            AVG(
              CASE WHEN fr."completedAt" > f."dateReceiver"
                THEN EXTRACT(EPOCH FROM (fr."completedAt" - f."dateReceiver")) / 3600
              END
            )                                                                             AS avg_delay_hours
          FROM freight_routes fr
          INNER JOIN freight f ON f.id = fr."freightId"
          WHERE fr."companyId" = $1
            AND fr.status = 'COMPLETED'
            AND f."dateReceiver" IS NOT NULL
            ${dateRouteFilter}
          `,
          params([]),
        ),

        this.freightRepository.manager.query(
          `
          SELECT
            COUNT(f.id)                                                         AS total,
            COUNT(CASE WHEN COALESCE(req_count.total_requests, 0) = 0 THEN 1 END) AS idle
          FROM freight f
          LEFT JOIN (
            SELECT "freightId", COUNT(id) AS total_requests
            FROM freight_requests
            GROUP BY "freightId"
          ) req_count ON req_count."freightId" = f.id
          WHERE f."companyId" = $1
            AND f."isExclude" = false
            ${dateFreightFilter}
          `,
          params([]),
        ),
      ]);

      const total = Number(deliveryResult[0]?.total_deliveries ?? 0);
      const onTime = Number(deliveryResult[0]?.on_time ?? 0);
      const late = Number(deliveryResult[0]?.late ?? 0);
      const avgDelayHours = Number(
        Number(deliveryResult[0]?.avg_delay_hours ?? 0).toFixed(2),
      );
      const totalFreights = Number(idleResult[0]?.total ?? 0);
      const idleFreights = Number(idleResult[0]?.idle ?? 0);

      return {
        period: dateRange ? { startDate, endDate } : null,
        onTimeDelivery: {
          rate: total > 0 ? Number(((onTime / total) * 100).toFixed(2)) : 0,
          total,
          onTime,
        },
        lateDelivery: {
          rate: total > 0 ? Number(((late / total) * 100).toFixed(2)) : 0,
          total,
          late,
          avgDelayHours,
          avgDelayDays: Number((avgDelayHours / 24).toFixed(2)),
        },
        idleRate: {
          rate:
            totalFreights > 0
              ? Number(((idleFreights / totalFreights) * 100).toFixed(2))
              : 0,
          totalFreights,
          idleFreights,
        },
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar KPIs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCycleTimes(
    companyId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    try {
      const dateRange = this.buildDateFilter(startDate, endDate);
      const dateRouteFilter = dateRange
        ? 'AND fr."startedAt" BETWEEN $2 AND $3'
        : '';
      const dateFreightFilter = dateRange
        ? 'AND f."createdAt" BETWEEN $2 AND $3'
        : '';
      const p = dateRange
        ? [companyId, dateRange.start, dateRange.end]
        : [companyId];

      const [
        pubToAcceptResult,
        acceptToRouteResult,
        routeDurationResult,
        fullCycleResult,
      ] = await Promise.all([
        this.freightRepository.manager.query(
          `
          SELECT
            AVG(EXTRACT(EPOCH FROM (accepted.accepted_at - f."createdAt")) / 3600)                                               AS avg_hours,
            PERCENTILE_CONT(0.5) WITHIN GROUP (
              ORDER BY EXTRACT(EPOCH FROM (accepted.accepted_at - f."createdAt")) / 3600
            )                                                                                                                     AS median_hours,
            MIN(EXTRACT(EPOCH FROM (accepted.accepted_at - f."createdAt")) / 3600)                                               AS min_hours,
            MAX(EXTRACT(EPOCH FROM (accepted.accepted_at - f."createdAt")) / 3600)                                               AS max_hours
          FROM freight f
          INNER JOIN (
            SELECT "freightId", MIN("updatedAt") AS accepted_at
            FROM freight_requests
            WHERE status = 'ACCEPTED'
            GROUP BY "freightId"
          ) accepted ON accepted."freightId" = f.id
          WHERE f."companyId" = $1
            AND f."isExclude" = false
            ${dateFreightFilter}
          `,
          p,
        ),

        this.freightRepository.manager.query(
          `
          SELECT
            AVG(EXTRACT(EPOCH FROM (fr."startedAt" - accepted.accepted_at)) / 3600)                                              AS avg_hours,
            PERCENTILE_CONT(0.5) WITHIN GROUP (
              ORDER BY EXTRACT(EPOCH FROM (fr."startedAt" - accepted.accepted_at)) / 3600
            )                                                                                                                     AS median_hours,
            MIN(EXTRACT(EPOCH FROM (fr."startedAt" - accepted.accepted_at)) / 3600)                                              AS min_hours,
            MAX(EXTRACT(EPOCH FROM (fr."startedAt" - accepted.accepted_at)) / 3600)                                              AS max_hours
          FROM freight_routes fr
          INNER JOIN (
            SELECT "freightId", MIN("updatedAt") AS accepted_at
            FROM freight_requests
            WHERE status = 'ACCEPTED'
            GROUP BY "freightId"
          ) accepted ON accepted."freightId" = fr."freightId"
          WHERE fr."companyId" = $1
            ${dateRouteFilter}
          `,
          p,
        ),

        this.freightRepository.manager.query(
          `
          SELECT
            AVG(EXTRACT(EPOCH FROM (fr."completedAt" - fr."startedAt")) / 3600)                                                  AS avg_hours,
            PERCENTILE_CONT(0.5) WITHIN GROUP (
              ORDER BY EXTRACT(EPOCH FROM (fr."completedAt" - fr."startedAt")) / 3600
            )                                                                                                                     AS median_hours,
            MIN(EXTRACT(EPOCH FROM (fr."completedAt" - fr."startedAt")) / 3600)                                                  AS min_hours,
            MAX(EXTRACT(EPOCH FROM (fr."completedAt" - fr."startedAt")) / 3600)                                                  AS max_hours
          FROM freight_routes fr
          WHERE fr."companyId" = $1
            AND fr.status = 'COMPLETED'
            ${dateRouteFilter}
          `,
          p,
        ),

        this.freightRepository.manager.query(
          `
          SELECT
            AVG(EXTRACT(EPOCH FROM (fr."completedAt" - f."createdAt")) / 3600)                                                   AS avg_hours,
            PERCENTILE_CONT(0.5) WITHIN GROUP (
              ORDER BY EXTRACT(EPOCH FROM (fr."completedAt" - f."createdAt")) / 3600
            )                                                                                                                     AS median_hours,
            MIN(EXTRACT(EPOCH FROM (fr."completedAt" - f."createdAt")) / 3600)                                                   AS min_hours,
            MAX(EXTRACT(EPOCH FROM (fr."completedAt" - f."createdAt")) / 3600)                                                   AS max_hours
          FROM freight_routes fr
          INNER JOIN freight f ON f.id = fr."freightId"
          WHERE fr."companyId" = $1
            AND fr.status = 'COMPLETED'
            ${dateRouteFilter}
          `,
          p,
        ),
      ]);

      return {
        period: dateRange ? { startDate, endDate } : null,
        publishToAccept: this.formatTime(pubToAcceptResult[0]),
        acceptToRoute: this.formatTime(acceptToRouteResult[0]),
        routeDuration: this.formatTime(routeDurationResult[0]),
        fullCycle: this.formatTime(fullCycleResult[0]),
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar tempos de ciclo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFreightsEvolution(companyId: string): Promise<any> {
    try {
      const now = new Date();
      const end = new Date(now);
      end.setUTCHours(23, 59, 59, 999);
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      start.setUTCHours(0, 0, 0, 0);

      const [published, accepted, concluded, late] = await Promise.all([
        this.freightRepository.manager.query(
          `
          SELECT TO_CHAR(f."createdAt", 'DD/MM') AS day, COUNT(f.id) AS count
          FROM freight f
          WHERE f."companyId" = $1
            AND f."isExclude" = false
            AND f."createdAt" BETWEEN $2 AND $3
          GROUP BY TO_CHAR(f."createdAt", 'DD/MM')
          ORDER BY TO_CHAR(f."createdAt", 'DD/MM') ASC
          `,
          [companyId, start, end],
        ),

        this.freightRepository.manager.query(
          `
          SELECT TO_CHAR(fr."updatedAt", 'DD/MM') AS day, COUNT(fr.id) AS count
          FROM freight_requests fr
          WHERE fr."companyId" = $1
            AND fr.status = 'ACCEPTED'
            AND fr."updatedAt" BETWEEN $2 AND $3
          GROUP BY TO_CHAR(fr."updatedAt", 'DD/MM')
          ORDER BY TO_CHAR(fr."updatedAt", 'DD/MM') ASC
          `,
          [companyId, start, end],
        ),

        this.freightRepository.manager.query(
          `
          SELECT TO_CHAR(fr."completedAt", 'DD/MM') AS day, COUNT(fr.id) AS count
          FROM freight_routes fr
          WHERE fr."companyId" = $1
            AND fr.status = 'COMPLETED'
            AND fr."completedAt" BETWEEN $2 AND $3
          GROUP BY TO_CHAR(fr."completedAt", 'DD/MM')
          ORDER BY TO_CHAR(fr."completedAt", 'DD/MM') ASC
          `,
          [companyId, start, end],
        ),

        this.freightRepository.manager.query(
          `
          SELECT TO_CHAR(fr."completedAt", 'DD/MM') AS day, COUNT(fr.id) AS count
          FROM freight_routes fr
          INNER JOIN freight f ON f.id = fr."freightId"
          WHERE fr."companyId" = $1
            AND fr.status = 'COMPLETED'
            AND f."dateReceiver" IS NOT NULL
            AND fr."completedAt" > f."dateReceiver"
            AND fr."completedAt" BETWEEN $2 AND $3
          GROUP BY TO_CHAR(fr."completedAt", 'DD/MM')
          ORDER BY TO_CHAR(fr."completedAt", 'DD/MM') ASC
          `,
          [companyId, start, end],
        ),
      ]);

      const toMap = (rows: { day: string; count: string }[]) =>
        Object.fromEntries(rows.map((r) => [r.day, Number(r.count)]));

      const publishedMap = toMap(published);
      const acceptedMap = toMap(accepted);
      const concludedMap = toMap(concluded);
      const lateMap = toMap(late);

      const days: string[] = [];
      const cursor = new Date(start);
      while (cursor <= end) {
        days.push(
          cursor.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            timeZone: 'UTC',
          }),
        );
        cursor.setDate(cursor.getDate() + 1);
      }

      return {
        period: {
          startDate: start.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
          endDate: end.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        },
        days,
        series: {
          published: days.map((d) => publishedMap[d] ?? 0),
          accepted: days.map((d) => acceptedMap[d] ?? 0),
          concluded: days.map((d) => concludedMap[d] ?? 0),
          late: days.map((d) => lateMap[d] ?? 0),
        },
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar evolução de fretes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCriticalFreights(companyId: string): Promise<any> {
    try {
      const now = new Date();

      const rows = await this.freightRoutesRepository
        .createQueryBuilder('fr')
        .innerJoinAndSelect('fr.freight', 'f')
        .where('fr.companyId = :companyId', { companyId })
        .andWhere('fr.status = :status', { status: RouteStatus.IN_PROGRESS })
        .andWhere('f.dateReceiver IS NOT NULL')
        .andWhere('f.dateReceiver < :now', { now })
        .orderBy('f.dateReceiver', 'ASC')
        .getMany();

      const data = rows.map((route) => {
        const overdueSince = route.freight.dateReceiver;
        const overdueHours = Number(
          (
            (now.getTime() - new Date(overdueSince).getTime()) /
            1000 /
            3600
          ).toFixed(2),
        );

        return {
          routeId: route.id,
          freightId: route.freightId,
          originCity: route.freight.originCity,
          originState: route.freight.originState,
          destinyCity: route.freight.destinyCity,
          destinyState: route.freight.destinyState,
          dateReceiver: route.freight.dateReceiver,
          routeStartedAt: route.startedAt,
          overdueHours,
          overdueDays: Number((overdueHours / 24).toFixed(2)),
        };
      });

      return {
        total: data.length,
        data,
      };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Erro ao buscar fretes críticos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
