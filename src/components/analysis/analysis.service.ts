import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Freight } from 'src/entities/freight.entity';
import {
  FreightRequest,
  FreightRequestStatus,
} from 'src/entities/freight-requests.entity';
import { FreightRoutes, RouteStatus } from 'src/entities/freight-routes.entity';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(Freight)
    private readonly freightRepository: Repository<Freight>,
    @InjectRepository(FreightRequest)
    private readonly freightRequestRepository: Repository<FreightRequest>,
    @InjectRepository(FreightRoutes)
    private readonly freightRoutesRepository: Repository<FreightRoutes>,
  ) {}

  async getAnalysis(companyId: string, dataInicio: string, dataFim: string) {
    const start = new Date(dataInicio);
    const end = new Date(dataFim);
    end.setHours(23, 59, 59, 999);

    const freights = await this.freightRepository.find({
      where: { companyId, createdAt: Between(start, end) },
      order: { createdAt: 'ASC' },
    });
    const freightIds = freights.map((f) => f.id);

    const acceptedRequests = await this.freightRequestRepository.find({
      where: {
        freightId: freightIds.length ? In(freightIds) : undefined,
        status: FreightRequestStatus.ACCEPTED,
        createdAt: Between(start, end),
      },
    });
    const acceptedFreightIds = new Set(
      acceptedRequests.map((r) => r.freightId),
    );

    const completedRoutes = await this.freightRoutesRepository.find({
      where: {
        freightId: freightIds.length ? In(freightIds) : undefined,
        status: RouteStatus.COMPLETED,
        completedAt: Between(start, end),
      },
    });
    const completedFreightIds = new Set(
      completedRoutes.map((r) => r.freightId),
    );

    let totalTimeToAccept = 0;
    let countAccepted = 0;
    for (const request of acceptedRequests) {
      const freight = freights.find((f) => f.id === request.freightId);
      if (freight) {
        totalTimeToAccept +=
          request.createdAt.getTime() - freight.createdAt.getTime();
        countAccepted++;
      }
    }
    const avgTimeToAccept = countAccepted
      ? totalTimeToAccept / countAccepted / 1000 / 60
      : 0; 
    const avgTimeToAcceptStr = this.formatMinutesToHourMinute(avgTimeToAccept);

    const freightsWithoutAccept = freights.filter(
      (f) => !acceptedFreightIds.has(f.id),
    );
    let totalIdleTime = 0;
    for (const f of freightsWithoutAccept) {
      totalIdleTime += end.getTime() - f.createdAt.getTime();
    }
    const avgIdleTime = freightsWithoutAccept.length
      ? totalIdleTime / freightsWithoutAccept.length / 1000 / 60
      : 0; 
    const avgIdleTimeStr = this.formatMinutesToHourMinute(avgIdleTime);

    const numWithoutAccept = freightsWithoutAccept.length;

    const days = this.getDaysArray(start, end);
    const lineData = days.map((day) => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      return {
        date: dayStart.toISOString().slice(0, 10),
        posted: freights.filter(
          (f) => f.createdAt >= dayStart && f.createdAt <= dayEnd,
        ).length,
        accepted: acceptedRequests.filter(
          (r) => r.createdAt >= dayStart && r.createdAt <= dayEnd,
        ).length,
        completed: completedRoutes.filter(
          (r) => r.completedAt >= dayStart && r.completedAt <= dayEnd,
        ).length,
      };
    });

    const freightRoutesProgress = await this.freightRoutesRepository.count({
      where: {
        freightId: freightIds.length ? In(freightIds) : undefined,
        status: RouteStatus.IN_PROGRESS,
        startedAt: Between(start, end),
      },
    });

    return {
      totalPosted: freights.length,
      totalAccepted: acceptedFreightIds.size,
      totalCompleted: completedFreightIds.size,
      avgTimeToAcceptStr,
      avgIdleTimeStr,
      numWithoutAccept,
      freightRoutesProgress,
      lineData,
    };
  }

  private getDaysArray(start: Date, end: Date) {
    const arr = [];
    const dt = new Date(start);
    dt.setHours(0, 0, 0, 0);
    while (dt <= end) {
      arr.push(new Date(dt));
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  }

  private formatMinutesToHourMinute(minutes: number): string {
    if (!minutes || minutes < 1) return '0m';
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
}
