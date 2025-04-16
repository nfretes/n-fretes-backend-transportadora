import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '@entities/company.entity';
import { PlansCompany } from '@entities/plans-company.entity';
import { Connection } from 'typeorm';
import {
  CreateSubscriptionDto,
  UpdateCreditCardDto,
} from './dto/create-subscription.dto';
import { SubscriptionCompany } from '@entities/subscription-company.entity';
import {
  PaymentMethod,
  Transactions,
  TransactionType,
} from '@entities/transactions.entity';
import { CreditCard } from '@entities/credit-card.entity';
@Injectable()
export class AsaasService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(PlansCompany)
    private plansRepository: Repository<PlansCompany>,
    @InjectRepository(SubscriptionCompany)
    private subscriptionRepository: Repository<SubscriptionCompany>,
    @InjectRepository(Transactions)
    private transactionRepository: Repository<Transactions>,
    @InjectRepository(CreditCard)
    private creditCardRepository: Repository<CreditCard>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly connection: Connection,
  ) {}

   /***********************************ASSAS CONFIG************************************************ */
  private getAsaasConfig() {
    return {
      baseUrl: this.configService.get<string>('ASAAS_BASE_URL'),
      apiToken: this.configService.get<string>('ASAAS_API_KEY'),
    };
  }
 /***********************************AUTH HEADERS************************************************ */
  private getAuthHeaders() {
    const { apiToken } = this.getAsaasConfig();
    return {
      'Content-Type': 'application/json',
      access_token: apiToken,
    };
  }
  /***********************************CREATE CUSTOMER************************************************ */
  async createOrGetCustomer(userId: string) {
    const { baseUrl } = this.getAsaasConfig();
    const user = await this.companyRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(
        'Transportadora não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.assas_id) {
      return user.assas_id;
    }
    const newCustomerData = {
      name: user.name,
      email: user.email,
      cpfCnpj: (user.cpf || user.cnpj || '').replace(/[^\d]/g, ''),
      phone: user.phoneNumber || '',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${baseUrl}/customers`, newCustomerData, {
          headers: this.getAuthHeaders(),
        }),
      );

      user.assas_id = response.data.id;
      await this.companyRepository.save(user);

      return user.assas_id;
    } catch (error) {
      this.handleAsaasError(error);
    }
  }
  /***********************************CREATE CREDIT CARD PAYMENY************************************ */
  async createCreditCardPayment(
    customerId: string,
    creditCardData: CreateSubscriptionDto['creditCard'],
    creditCardHolderInfo: CreateSubscriptionDto['creditCardHolderInfo'],
    clientIp: string,
    userId: string,
  ) {
    const { baseUrl } = this.getAsaasConfig();
    const queryRunner =
      this.creditCardRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const creditCardTokenData = {
        customer: customerId,
        remoteIp: clientIp,
        creditCard: {
          holderName: creditCardData.holderName,
          number: creditCardData.number,
          expiryMonth: creditCardData.expiryMonth,
          expiryYear: creditCardData.expiryYear,
          ccv: creditCardData.ccv,
        },
        creditCardHolderInfo: {
          name: creditCardHolderInfo.name,
          email: creditCardHolderInfo.email,
          cpfCnpj: creditCardHolderInfo.cpfCnpj.replace(/[^\d]/g, ''),
          postalCode: creditCardHolderInfo.postalCode,
          addressNumber: creditCardHolderInfo.addressNumber,
          phone: creditCardHolderInfo.phone,
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/creditCard/tokenizeCreditCard`,
          creditCardTokenData,
          { headers: this.getAuthHeaders() },
        ),
      );

      if (!response.data?.creditCardToken) {
        throw new HttpException(
          'Falha na tokenização do cartão',
          HttpStatus.BAD_REQUEST,
        );
      }

      const savedCard = queryRunner.manager.create(CreditCard, {
        companyId: userId,
        lastFourDigits: creditCardData.number.slice(-4),
        brand: this.detectCardBrand(creditCardData.number),
        holderName: creditCardData.holderName,
        expirationMonth: creditCardData.expiryMonth,
        expirationYear: creditCardData.expiryYear,
        creditCardToken: response.data.creditCardToken,
        isDefault: true,
      });

      await queryRunner.manager.save(savedCard);
      await queryRunner.commitTransaction();

      return response.data.creditCardToken;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleAsaasError(error);
    } finally {
      await queryRunner.release();
    }
  }

  /*********************************CREATE CREDIT CARD********************************************** */
  async createCreditCard(
    createCreditCardDto: UpdateCreditCardDto,
    clientIp: string,
    userId: string,
  ) {
    const { baseUrl } = this.getAsaasConfig();
    const user = await this.companyRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.assas_id) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    const queryRunner =
      this.creditCardRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lastFourDigits = createCreditCardDto.creditCard.number.slice(-4);
      const existingCard = await queryRunner.manager.findOne(CreditCard, {
        where: {
          companyId: userId,
          lastFourDigits,
        },
      });

      if (existingCard) {
        throw new HttpException(
          'Cartão com estes últimos 4 dígitos já está cadastrado',
          HttpStatus.CONFLICT,
        );
      }

      const creditCardTokenData = {
        customer: user.assas_id,
        remoteIp: clientIp,
        creditCard: {
          holderName: createCreditCardDto.creditCard.holderName,
          number: createCreditCardDto.creditCard.number,
          expiryMonth: createCreditCardDto.creditCard.expiryMonth,
          expiryYear: createCreditCardDto.creditCard.expiryYear,
          ccv: createCreditCardDto.creditCard.ccv,
        },
        creditCardHolderInfo: {
          name: createCreditCardDto.creditCardHolderInfo.name,
          email: createCreditCardDto.creditCardHolderInfo.email,
          cpfCnpj: createCreditCardDto.creditCardHolderInfo.cpfCnpj.replace(
            /[^\d]/g,
            '',
          ),
          postalCode: createCreditCardDto.creditCardHolderInfo.postalCode,
          addressNumber: createCreditCardDto.creditCardHolderInfo.addressNumber,
          phone: createCreditCardDto.creditCardHolderInfo.phone,
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/creditCard/tokenizeCreditCard`,
          creditCardTokenData,
          { headers: this.getAuthHeaders() },
        ),
      );

      if (!response.data?.creditCardToken) {
        throw new HttpException(
          'Falha na tokenização do cartão',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (createCreditCardDto.isDefault) {
        await queryRunner.manager.update(
          CreditCard,
          { companyId: userId, isDefault: true },
          { isDefault: false },
        );
      }

      const isDefault =
        createCreditCardDto.isDefault ??
        !(await queryRunner.manager.exists(CreditCard, {
          where: { companyId: userId },
        }));

      const savedCard = queryRunner.manager.create(CreditCard, {
        companyId: userId,
        lastFourDigits,
        brand: this.detectCardBrand(createCreditCardDto.creditCard.number),
        holderName: createCreditCardDto.creditCard.holderName,
        expirationMonth: createCreditCardDto.creditCard.expiryMonth,
        expirationYear: createCreditCardDto.creditCard.expiryYear,
        creditCardToken: response.data.creditCardToken,
        isDefault,
      });

      await queryRunner.manager.save(savedCard);
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Cartão cadastrado com sucesso',
        creditCardId: savedCard.id,
        isDefault,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error?.response?.message?.includes('já está cadastrado')) {
        throw error;
      }

      this.handleAsaasError(error);
    } finally {
      await queryRunner.release();
    }
  }
  /************************************CREATE SUBSCRIPTION****************************************** */
  async createSubscription(
    userId: string,
    createSubscriptionDto: CreateSubscriptionDto,
    clientIp: string,
  ) {
    const { baseUrl } = this.getAsaasConfig();

    const queryRunner =
      this.subscriptionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingSubscription = await this.subscriptionRepository.findOne({
        where: { companyId: userId },
      });

      const customerId = await this.createOrGetCustomer(userId);

      if (!customerId) {
        throw new HttpException(
          'Cliente Asaas não foi criado corretamente',
          HttpStatus.BAD_REQUEST,
        );
      }

      await queryRunner.manager.update(
        CreditCard,
        { companyId: userId, isDefault: true },
        { isDefault: false },
      );

      const { planId } = createSubscriptionDto;
      const plan = await this.plansRepository.findOne({
        where: { id: planId },
      });

      if (!plan) {
        throw new HttpException('Plano não encontrado', HttpStatus.NOT_FOUND);
      }

      const creditCardToken = await this.createCreditCardPayment(
        customerId,
        createSubscriptionDto.creditCard,
        createSubscriptionDto.creditCardHolderInfo,
        clientIp,
        userId,
      );

      const subscriptionData = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value: plan.value,
        nextDueDate: new Date().toISOString().split('T')[0],
        cycle: 'MONTHLY',
        description: `Assinatura mensal`,
        creditCardToken,
        remoteIp: clientIp,
      };

      const subscriptionResponse = await firstValueFrom(
        this.httpService.post(`${baseUrl}/subscriptions`, subscriptionData, {
          headers: this.getAuthHeaders(),
        }),
      );

      const now = new Date();
      const nextRecurrency = new Date(now);
      nextRecurrency.setMonth(nextRecurrency.getMonth() + 1);

      const endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 1);

      const newInterval = existingSubscription
        ? existingSubscription.interval + 1
        : 1;

      const transaction = this.transactionRepository.create({
        amount: plan.value,
        reason: `Assinatura do plano ${plan.name}`,
        companyId: userId,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        transactionType: TransactionType.COMPANY,
      });
      await queryRunner.manager.save(transaction);
      if (existingSubscription) {
        existingSubscription.status = 1;
        existingSubscription.merchantOrderId = subscriptionResponse.data.id;
        existingSubscription.amount = plan.value;
        existingSubscription.nextRecurrency = nextRecurrency.toISOString();
        existingSubscription.endDate = endDate.toISOString();
        existingSubscription.planId = plan.id;
        existingSubscription.interval = newInterval;

        await queryRunner.manager.save(existingSubscription);
      } else {
        const newSubscription = this.subscriptionRepository.create({
          status: 1,
          merchantOrderId: subscriptionResponse.data.id,
          companyId: userId,
          amount: plan.value,
          nextRecurrency: nextRecurrency.toISOString(),
          endDate: endDate.toISOString(),
          planId: plan.id,
          interval: newInterval,
        });

        await queryRunner.manager.save(newSubscription);
      }

      await queryRunner.commitTransaction();

      return {
        subscriptionId: subscriptionResponse.data.id,
        status: subscriptionResponse.data.status,
        invoiceUrl: subscriptionResponse.data.invoiceUrl,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleAsaasError(error);
    } finally {
      await queryRunner.release();
    }
  }
  /**********************************DELETE SUBSCRIPTION******************************************** */
  async deleteSubscription(merchantOrderId: string) {
    const { baseUrl } = this.getAsaasConfig();

    const queryRunner =
      this.subscriptionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { merchantOrderId },
      });

      if (!subscription) {
        throw new HttpException(
          'Subscrição não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }

      const response = await firstValueFrom(
        this.httpService.put(
          `${baseUrl}/subscriptions/${merchantOrderId}`,
          { status: 'INACTIVE' },
          {
            headers: this.getAuthHeaders(),
          },
        ),
      );
      subscription.status = 2;
      //@ts-ignore
      subscription.endDate = new Date();
      await queryRunner.manager.save(SubscriptionCompany, subscription);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Assinatura cancelada com sucesso',
        asaasResponse: response.data,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleAsaasError(error);
    } finally {
      await queryRunner.release();
    }
  }
  /*********************************CREATE CARD UPDATE********************************************** */
  async creditCardUpdate(userId: string, creditCardId: string) {
    const queryRunner =
      this.creditCardRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { baseUrl } = this.getAsaasConfig();

      const user = await queryRunner.manager.findOne(Company, {
        where: { id: userId },
        relations: ['subscription'],
      });

      if (!user?.subscription?.merchantOrderId) {
        throw new HttpException(
          'Assinatura não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }

      const creditCard = await queryRunner.manager.findOne(CreditCard, {
        where: { id: creditCardId, companyId: userId },
      });

      if (!creditCard) {
        throw new HttpException('Cartão não encontrado', HttpStatus.NOT_FOUND);
      }

      await queryRunner.manager.update(
        CreditCard,
        { companyId: userId, isDefault: true },
        { isDefault: false },
      );

      await queryRunner.manager.update(
        CreditCard,
        { id: creditCardId },
        { isDefault: true },
      );

      const response = await firstValueFrom(
        this.httpService.put(
          `${baseUrl}/subscriptions/${user.subscription.merchantOrderId}/creditCard`,
          { creditCardToken: creditCard.creditCardToken },
          { headers: this.getAuthHeaders() },
        ),
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Cartão padrão atualizado com sucesso',
        data: {
          asaasResponse: response.data,
          isDefault: true,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleAsaasError(error);
    } finally {
      await queryRunner.release();
    }
  }
  /***********************************HANDLE ASSAS ERROR******************************************* */
  private handleAsaasError(error: any) {
    const responseData = error?.response?.data;

    if (responseData) {
      console.log(responseData, '#DATA#');
    }
    const defaultError = {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Erro desconhecido ao se comunicar com o Asaas',
      error: 'Asaas API Error',
      details: [],
    };
    if (responseData?.errors) {
      const [firstError] = responseData.errors;

      throw new HttpException(
        {
          ...defaultError,
          message: firstError?.description,
          details: {
            code: firstError?.code,
            description: firstError?.description,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (responseData) {
      throw new HttpException(
        {
          ...defaultError,
          message: responseData.message || 'Erro na API Asaas',
          details: responseData,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    throw new HttpException(
      {
        ...defaultError,
        message: error.message || defaultError.message,
        details: error,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  /************************************DETECTCARDBRAND********************************************* */
  private detectCardBrand(number: string): string {
    const firstDigit = number[0];
    switch (firstDigit) {
      case '4':
        return 'VISA';
      case '5':
        return 'MASTERCARD';
      case '3':
        return 'AMEX';
      case '6':
        return 'DISCOVER';
      default:
        return 'UNKNOWN';
    }
  }
  /*********************************** RENOVE SUBSCRIPTION***************************************** */

  async renoveSubscription(
    userId: string,
    clientIp: string,
    creditCardId: string,
  ) {
    const { baseUrl } = this.getAsaasConfig();

    const queryRunner =
      this.subscriptionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const user = await this.companyRepository.findOne({
      where: { id: userId },
      relations: ['subscription'],
    });

    try {
      const existingSubscription = await this.subscriptionRepository.findOne({
        where: { companyId: userId },
      });

      const customerId = user.assas_id;
      if (!customerId) {
        throw new HttpException(
          'Cliente Asaas não foi criado corretamente',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!creditCardId) {
        throw new HttpException(
          'Cartão não encontrado',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.creditCardRepository.update(
        { companyId: userId },
        { isDefault: false },
      );

      await this.creditCardRepository.update(
        { id: creditCardId, companyId: userId },
        { isDefault: true },
      );

      const plan = await this.plansRepository.findOne({
        where: { id: user.subscription.planId },
      });

      if (!plan) {
        throw new HttpException('Plano não encontrado', HttpStatus.NOT_FOUND);
      }

      const userCreditToken = await this.creditCardRepository.findOne({
        where: { id: creditCardId },
      });

      if (userCreditToken.creditCardToken.length === 0) {
        throw new HttpException('Cartão inválido', HttpStatus.NOT_FOUND);
      }

      const subscriptionData = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value: plan.value,
        nextDueDate: new Date().toISOString().split('T')[0],
        cycle: 'MONTHLY',
        description: `Assinatura mensal`,
        creditCardToken: userCreditToken.creditCardToken,
        remoteIp: clientIp,
      };

      const subscriptionResponse = await firstValueFrom(
        this.httpService.post(`${baseUrl}/subscriptions`, subscriptionData, {
          headers: this.getAuthHeaders(),
        }),
      );

      const now = new Date();
      const nextRecurrency = new Date(now);
      nextRecurrency.setMonth(nextRecurrency.getMonth() + 1);

      const endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 1);

      const newInterval = existingSubscription
        ? existingSubscription.interval + 1
        : 1;

      const transaction = this.transactionRepository.create({
        amount: plan.value,
        reason: `Reativação do plano ${plan.name}`,
        companyId: userId,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        transactionType: TransactionType.COMPANY,
      });
      await queryRunner.manager.save(transaction);
      if (existingSubscription) {
        existingSubscription.status = 1;
        existingSubscription.merchantOrderId = subscriptionResponse.data.id;
        existingSubscription.amount = plan.value;
        existingSubscription.nextRecurrency = nextRecurrency.toISOString();
        existingSubscription.endDate = endDate.toISOString();
        existingSubscription.planId = plan.id;
        existingSubscription.interval = newInterval;

        await queryRunner.manager.save(existingSubscription);
      } else {
        const newSubscription = this.subscriptionRepository.create({
          status: 1,
          merchantOrderId: subscriptionResponse.data.id,
          companyId: userId,
          amount: plan.value,
          nextRecurrency: nextRecurrency.toISOString(),
          endDate: endDate.toISOString(),
          planId: plan.id,
          interval: newInterval,
        });

        await queryRunner.manager.save(newSubscription);
      }

      await queryRunner.commitTransaction();

      return {
        subscriptionId: subscriptionResponse.data.id,
        status: subscriptionResponse.data.status,
        invoiceUrl: subscriptionResponse.data.invoiceUrl,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleAsaasError(error);
    } finally {
      await queryRunner.release();
    }
  }
  /***********************************GET ALL CREDITCARD***************************************** */
  async getAllCreditCard(userId: string) {
    const creditCardAll = await this.creditCardRepository.find({
      where: { companyId: userId },
      order: { isDefault: 'DESC' },
    });

    return creditCardAll;
  }
  /***********************************DELETE CREDITCARD***************************************** */
  async deleteCreditCard(
    cardId: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const card = await this.creditCardRepository.findOne({
        where: {
          id: cardId,
        },
      });

      if (!card) {
        return { success: false, message: 'Cartão não encontrado' };
      }

      if (card.isDefault) {
        return {
          success: false,
          message: 'Não é possível deletar o cartão padrão',
        };
      }

      await this.creditCardRepository.delete({
        id: cardId,
        companyId: card.companyId,
      });

      return { success: true, message: 'Cartão deletado com sucesso' };
    } catch (error) {
      throw new HttpException(
        error?.message || error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /***********************************UPGRADE PLANO***************************************** */

  async upgradePlan(userId: string, newPlanId: string, clientIp: string) {
    const queryRunner = this.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const user = await queryRunner.manager.findOne(Company, {
        where: { id: userId },
        relations: ['subscription', 'subscription.plan', 'creditCard'],
      });

      const { baseUrl } = this.getAsaasConfig();
      const merchantOrderId = user.subscription.merchantOrderId;

      if (!user) {
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }

      if (!user.subscription) {
        throw new HttpException(
          'Usuário não possui assinatura ativa',
          HttpStatus.BAD_REQUEST,
        );
      }

      const currentPlan = user.subscription.plan;
      const currentSubscription = user.subscription;

      const newPlan = await queryRunner.manager.findOne(PlansCompany, {
        where: { id: newPlanId },
      });

      if (!newPlan) {
        throw new HttpException(
          'Novo plano não encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      if (newPlan.value <= currentPlan.value) {
        throw new HttpException(
          'Operação permitida apenas para upgrades',
          HttpStatus.BAD_REQUEST,
        );
      }

      const prorataValue = this.calculateProrata(
        currentSubscription,
        currentPlan,
        newPlan,
      );

      const subscriptionData = {
        customer: user.assas_id,
        billingType: 'CREDIT_CARD',
        value: prorataValue.valueToPay,
        dueDate: new Date().toISOString().split('T')[0],
        description: `Upgrade para o plano ${newPlan.name}`,
        creditCardToken: user.creditCard.find((item) => item.isDefault === true)
          ?.creditCardToken,
        remoteIp: clientIp,
      };

      const subscriptionResponse = await firstValueFrom(
        this.httpService.post(`${baseUrl}/payments`, subscriptionData, {
          headers: this.getAuthHeaders(),
        }),
      );

      if (subscriptionResponse.data.status === 'CONFIRMED') {
        try {
          await firstValueFrom(
            this.httpService.put(
              `${baseUrl}/subscriptions/${merchantOrderId}`,
              { value: newPlan.value },
              {
                headers: this.getAuthHeaders(),
              },
            ),
          );

          const subscription = await queryRunner.manager.findOne(
            SubscriptionCompany,
            {
              where: { merchantOrderId },
            },
          );

          subscription.amount = newPlan.value;
          subscription.planId = newPlan.id;
          await queryRunner.manager.save(subscription);

          const transaction = queryRunner.manager.create(Transactions, {
            amount: newPlan.value,
            reason: `Upgrade de plano ${newPlan.name}`,
            companyId: userId,
            paymentMethod: PaymentMethod.CREDIT_CARD,
            transactionType: TransactionType.COMPANY,
          });
          await queryRunner.manager.save(transaction);

          await queryRunner.commitTransaction();
        } catch (error) {
          await queryRunner.rollbackTransaction();
          console.log(error, 'Retorno do erro');
          this.handleAsaasError(error);
          throw error;
        }
      } else {
        throw new HttpException(
          'Não foi possível realizar pagamento tente novamente com outro cartão',
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        success: true,
      };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      this.handleAsaasError(error);
      throw new HttpException(
        error?.message || error,
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /***********************************TRAZER PRORATA GET***************************************** */

  async getProrataValue(userId: string, planId: string) {
    const user = await this.companyRepository.findOne({
      where: { id: userId },
      relations: ['subscription', 'subscription.plan', 'creditCard'],
    });

    const currentPlan = user.subscription.plan;
    const currentSubscription = user.subscription;
    const newPlan = await this.plansRepository.findOne({
      where: { id: planId },
    });
    const prorataValue = this.calculateProrata(
      currentSubscription,
      currentPlan,
      newPlan,
    );

    return prorataValue;
  }
  /***********************************CALCULATE PRORATA VALUE***************************************** */
  private calculateProrata(
    currentSubscription: SubscriptionCompany,
    currentPlan: PlansCompany,
    newPlan: PlansCompany,
  ) {
    const now = new Date();
    const cycleEnd = new Date(currentSubscription.nextRecurrency);
    const createdAt = new Date(currentSubscription.createdAt);

    if (isNaN(cycleEnd.getTime())) {
      throw new Error('Data de término do ciclo é inválida');
    }
    if (isNaN(createdAt.getTime())) {
      throw new Error('Data de criação da assinatura é inválida');
    }

    const daysRemaining = Math.ceil(
      (cycleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    const totalDaysCycle = Math.ceil(
      (cycleEnd.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (newPlan.value <= currentPlan.value) {
      throw new HttpException(
        'O valor do novo plano deve ser maior que o plano atual para cálculo de prorata',
        HttpStatus.BAD_REQUEST,
      );
    }
    const daysUsed = totalDaysCycle - daysRemaining;
    const currentPlanCredit =
      currentPlan.value * (daysRemaining / totalDaysCycle);
    const priceDifference = newPlan.value - currentPlan.value;
    const prorataValue = priceDifference * (daysRemaining / totalDaysCycle);
    const newPlanPartialValue =
      newPlan.value * (daysRemaining / totalDaysCycle);
    const discount = newPlanPartialValue - prorataValue;

    return {
      valueToPay: Number(prorataValue.toFixed(2)),
      currentPlanCredit: Number(currentPlanCredit.toFixed(2)),
      daysUsed: daysUsed,
      daysRemaining: daysRemaining,
      totalDaysCycle: totalDaysCycle,
      discountApplied: Number(discount.toFixed(2)),
      explanation:
        `Você utilizou ${daysUsed} dias de um ciclo de ${totalDaysCycle} dias. ` +
        `Seu crédito do plano atual é R$ ${currentPlanCredit.toFixed(2)} ` +
        `(${daysRemaining} dias não utilizados). O desconto aplicado foi de R$ ${discount.toFixed(2)}.`,
    };
  }
/**************************************************************************************************** */
}


