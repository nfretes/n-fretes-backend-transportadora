import { SubscriptionCompanyResponseDto } from "@components/subscriptions-company/dto/response-subscription.dto";

export const SubscriptionErroUpdateSubscription = {
    status: 500,
    description: 'Erro ao atualizar a subscrição',
    schema: {
      example: {
        statusCode: 500,
        message: 'Erro ao Atualizar a subscrição',
      },
    },
  };

  export const SubscriptionNotFound = {
    status: 401,
    description: 'Subscrição não encontrada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Subscrição não encontrada',
      },
    },
  };
  

  export const UpdateSubscriptionSucess = {
    status: 200,
    description: 'Subinscrição atualizada com sucesso',
    schema: {
      example: {
        statusCode: 200,
        message: 'update da subinscrição realizada com sucesso',
      },
    },
  };
  

  export const CreateSubscriptionSucess = {
    status: 200,
    description: 'Subinscrição atualizada com sucesso',
    schema: {
      example: {
        statusCode: 200,
         type: SubscriptionCompanyResponseDto
      },
    },
  };
  