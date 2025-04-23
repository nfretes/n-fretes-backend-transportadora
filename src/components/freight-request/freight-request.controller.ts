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

@UseGuards(JwtAuthGuard)
@Controller('freight-request')
export class FreightRequestController {
  constructor(private readonly freightRequestService: FreightRequestService) {}

  @Post()
  create(@Body() createFreightRequestDto: CreateFreightRequestDto) {
    return this.freightRequestService.create(createFreightRequestDto);
  }

  @Get()
  findAll(@GetUserId() userId: string, @Query()params: ParamsFreightRequest) {
    return this.freightRequestService.findAll(userId, params);
  }


  @Patch(':id/accept')
  async acceptFreightRequest(
    @Param('id') id: string,
  ) {
    return this.freightRequestService.acceptFreightRequest(id);
  }


  @Patch(':id/accept-user')
  async acceptFreightRequestUserDrive(
    @Param('id') id: string,
    @Body() status: FreightRequestStatus
  ) {
    return this.freightRequestService.acceptFreightRequestUserDrive(id,status);
  }
}
