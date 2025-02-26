import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FreightRequestService } from './freight-request.service';
import { CreateFreightRequestDto } from './dto/create-freight-request.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { GetUserId } from 'src/decorators/get-user-decorator';
import { ParamsFreightRequest } from './interface/IFreightRequest';
import { FreightRequestStatus } from '@entities/freight-requests.entity';

@Controller('freight-request')
export class FreightRequestController {
  constructor(private readonly freightRequestService: FreightRequestService) {}

  @Post()
  create(@Body() createFreightRequestDto: CreateFreightRequestDto) {
    return this.freightRequestService.create(createFreightRequestDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@GetUserId() userId: string, params: ParamsFreightRequest) {
    return this.freightRequestService.findAll(userId, params);
  }

  @Patch(':id/accept')
  @UseGuards(JwtAuthGuard)
  async acceptFreightRequest(
    @Param('id') id: string,
    @Body('status') status: FreightRequestStatus,
  ) {
    return this.freightRequestService.acceptFreightRequest(id, status);
  }
}
