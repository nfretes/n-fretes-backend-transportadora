import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
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
  @UseGuards(JwtAuthGuard)
  create(@Body() createFreightRequestDto: CreateFreightRequestDto) {
    return this.freightRequestService.create(createFreightRequestDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@GetUserId() userId: string, @Query()params: ParamsFreightRequest) {
    return this.freightRequestService.findAll(userId, params);
  }


  @Patch(':id/accept')
  @UseGuards(JwtAuthGuard)
  async acceptFreightRequest(
    @Param('id') id: string,
  ) {
    return this.freightRequestService.acceptFreightRequest(id);
  }


  @Patch(':id/accept-user')
  @UseGuards(JwtAuthGuard)
  async acceptFreightRequestUserDrive(
    @Param('id') id: string,
    @Body() status: FreightRequestStatus
  ) {
    return this.freightRequestService.acceptFreightRequestUserDrive(id,status);
  }
}
