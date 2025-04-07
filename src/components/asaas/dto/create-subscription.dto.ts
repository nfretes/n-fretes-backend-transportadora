import {
  IsString,
  IsNotEmpty,
  IsCreditCard,
  Length,
  IsEmail,
  IsPostalCode,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreditCardDto {
  @IsNotEmpty()
  @IsString()
  holderName: string;

  @IsCreditCard()
  number: string;

  @Length(2, 2)
  expiryMonth: string;

  @Length(4, 4)
  expiryYear: string;

  @Length(3, 4)
  ccv: string;
}

class CreditCardHolderInfoDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  cpfCnpj: string;

  @IsPostalCode('BR')
  postalCode: string;

  @IsNotEmpty()
  addressNumber: string;

  @IsNotEmpty()
  phone: string;
}

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreditCardDto)
  creditCard: CreditCardDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreditCardHolderInfoDto)
  creditCardHolderInfo: CreditCardHolderInfoDto;
}

export class UpdateCreditCardDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreditCardDto)
  creditCard: CreditCardDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreditCardHolderInfoDto)
  creditCardHolderInfo: CreditCardHolderInfoDto;

  isDefault?: boolean;
}
