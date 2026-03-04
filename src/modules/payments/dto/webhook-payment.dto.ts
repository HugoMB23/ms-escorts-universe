import { IsObject } from 'class-validator';

export class WebhookPaymentDto {
  @IsObject()
  payload: Record<string, any>;
}
