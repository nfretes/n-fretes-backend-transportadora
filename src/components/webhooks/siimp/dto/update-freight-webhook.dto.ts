import { PartialType } from '@nestjs/swagger';
import { CreateFreightWebhookDto } from './create-freight-webhook.dto';

export class UpdateFreightWebhookDto extends PartialType(
  CreateFreightWebhookDto,
) {}
