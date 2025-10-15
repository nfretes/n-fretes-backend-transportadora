import {
  Controller,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
  Put,
  Get,
  Query,
} from '@nestjs/common';
import { AsaasService } from './assas.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { GetUserId } from 'src/decorators/get-user-decorator';
import {
  CreateSubscriptionDto,
  UpdateCreditCardDto,
} from './dto/create-subscription.dto';
import { ClientIp } from 'src/decorators/get-user-ip-decorator';

@Controller('assas')
export class AsaasController {
  constructor(private readonly asaasService: AsaasService) {}

  /**********************CRIAR SUBSCRIPTIONS********** */
  @UseGuards(JwtAuthGuard)
  @Post('subscriptions')
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @GetUserId() userId: string,
    @ClientIp() clientIp: string,
  ) {
    const result = await this.asaasService.createSubscription(
      userId,
      createSubscriptionDto,
      clientIp,
    );
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':merchantOrderId/subscriptions')
  async deleteSubscription(@Param('merchantOrderId') merchantOrderId: string) {
    const result = await this.asaasService.deleteSubscription(merchantOrderId);
    return result;
  }

  /**********************ATUALIZAR O CARTÃO DA RECORRENCIA********** */

  @UseGuards(JwtAuthGuard)
  @Put('creditCard')
  async updateCreditCard(
    @GetUserId() userId: string,
    @Query('creditCardId') creditCardId: string,
  ) {
    const result = await this.asaasService.creditCardUpdate(
      userId,
      creditCardId,
    );
    return result;
  }

  /**********************CRIAR NOVO METODO DE PAGAMENTO********** */
  @UseGuards(JwtAuthGuard)
  @Post('create/creditcard')
  async createCreditCardPayment(
    @GetUserId() userId: string,
    @ClientIp() clientIp: string,
    @Body() createCreditCardDto: UpdateCreditCardDto,
  ) {
    const result = await this.asaasService.createCreditCard(
      createCreditCardDto,
      clientIp,
      userId,
    );
    return result;
  }

  /**********************RENOVAR ASSINATURA ************************* */
  @UseGuards(JwtAuthGuard)
  @Post('subscriptions/renove')
  async renoveSubscription(
    @GetUserId() userId: string,
    @ClientIp() clientIp: string,
    @Query('creditCardId') creditCardId: string,
  ) {
    const result = await this.asaasService.renoveSubscription(
      userId,
      clientIp,
      creditCardId,
    );
    return result;
  }

  /********************** TRAZER OS CARTÕES DA EMPRESA ************************* */
  @UseGuards(JwtAuthGuard)
  @Get('creditcard')
  async creditCardAll(@GetUserId() userId: string) {
    const result = await this.asaasService.getAllCreditCard(userId);
    return result;
  }

  /********************** DELETAR  OS CARTÕES DA EMPRESA ************************* */

  @Delete(':cardId/delete')
  async deleteCreditCard(@Param('cardId') cardId: string) {
    const result = await this.asaasService.deleteCreditCard(cardId);

    return result;
  }

  /**********************ATUALIZAR O PLANO DA RECORRENCIA********** */

  @UseGuards(JwtAuthGuard)
  @Put('subscriptions/upgrade/:planId')
  async upgradePlan(
    @GetUserId() userId: string,
    @Param('planId') planId: string,
    @ClientIp() clientIp: string,
  ) {
    const result = await this.asaasService.upgradePlan(
      userId,
      planId,
      clientIp,
    );
    return result;
  }

  /**********************TRAZ O VALOR DA PRORATA********** */

  @UseGuards(JwtAuthGuard)
  @Get('prorata/:planId')
  async getProrataValue(
    @GetUserId() userId: string,
    @Param('planId') planId: string,
  ) {
    const result = await this.asaasService.getProrataValue(userId, planId);
    return result;
  }
}
