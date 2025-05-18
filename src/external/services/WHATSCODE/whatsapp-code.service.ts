import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WhatsappService {
  private readonly baseURL: string;

  constructor(private readonly httpService: HttpService) {
    this.baseURL =
      'https://api.ezchatbot.ai/run/9edd494d-d954-49c5-9e74-2d859da633ee?sender=2FA&token=ec348b13-4b5c-4e37-a557-77c44cb04b22';
  }

  async whatsAppCode(phone: string, code: number) {
    try {
      const url = `${this.baseURL}`;
      const data = {
        phone,
        code,
      };
      const response = await firstValueFrom(this.httpService.post(url, data));

      if (response.status !== 200) {
        throw new HttpException(
          'Erro ao enviar código de redefinição',
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.response?.data?.message || 'Erro ao enviar código de redefinição',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
