import { Body, Controller, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';

import { CompanyService } from './company.service';
import { GetUserId } from 'src/decorators/get-user-decorator';
import { companyUpdateDto } from './dto/Company.dto';
import { companyUpdateDtoSwagger } from 'src/common/company-swagger/company-swagger';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /********************************************************************************** */

  @UseGuards(JwtAuthGuard)
  @Put('update')
  @ApiOperation({
    summary: companyUpdateDtoSwagger.summary,
    description: companyUpdateDtoSwagger.description,
  })
  @ApiBody(companyUpdateDtoSwagger.requestBody)
  @ApiResponse(companyUpdateDtoSwagger.responses[200])
  @ApiResponse(companyUpdateDtoSwagger.responses[400])
  @ApiResponse(companyUpdateDtoSwagger.responses[500])
  async updatePlan(
    @GetUserId() userId: string,
    @Body() body: companyUpdateDto,
  ): Promise<{ message: string }> {
    return this.companyService.updateUserIdCompany(userId, body);
  }
}
