import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PlateLookupResponse } from './interface/IPlate';

@Injectable()
export class PlateLookupService {
  private readonly baseURL: string;
  private readonly token: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseURL = this.configService.get<string>('BASE_URL_API_PLACA');
    this.token = this.configService.get<string>('API_TOKEN_PLACA');
  }

  async lookupPlate(plate: string): Promise<PlateLookupResponse> {
    try {
      const url = `${this.baseURL}/consulta/${plate}/${this.token}`;
      const response = await firstValueFrom(this.httpService.get(url));

      if (response.status !== 200) {
        throw new HttpException(
          'Erro ao consultar a placa',
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.response?.data?.message || 'Erro ao consultar a API de placas',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
