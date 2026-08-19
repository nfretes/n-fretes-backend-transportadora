export enum PaymentStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  CONFIRMED = 'CONFIRMED',
  OVERDUE = 'OVERDUE',
  REFUNDED = 'REFUNDED',
  RECEIVED_IN_CASH = 'RECEIVED_IN_CASH',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  CHARGEBACK_REQUESTED = 'CHARGEBACK_REQUESTED',
  CHARGEBACK_DISPUTE = 'CHARGEBACK_DISPUTE',
  AWAITING_CHARGEBACK_REVERSAL = 'AWAITING_CHARGEBACK_REVERSAL',
  DUNNING_REQUESTED = 'DUNNING_REQUESTED',
  DUNNING_RECEIVED = 'DUNNING_RECEIVED',
  AWAITING_RISK_ANALYSIS = 'AWAITING_RISK_ANALYSIS',
}

export enum BillingType {
  CREDIT_CARD = 'CREDIT_CARD',
  BOLETO = 'BOLETO',
  PIX = 'PIX',
  UNDEFINED = 'UNDEFINED',
}

export enum CreditCardBrand {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  AMEX = 'AMEX',
  ELO = 'ELO',
  AURA = 'AURA',
  JCB = 'JCB',
  DINERS = 'DINERS',
  DISCOVER = 'DISCOVER',
  HIPERCARD = 'HIPERCARD',
}

export enum DiscountType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export enum ChargebackStatus {
  REQUESTED = 'REQUESTED',
  DISPUTE = 'DISPUTE',
  REVERSED = 'REVERSED',
}

export interface CreditCardInfo {
  creditCardNumber: string;
  creditCardBrand: CreditCardBrand;
  creditCardToken: string;
}

export interface Discount {
  value: number;
  dueDateLimitDays: number;
  limitedDate: string | null;
  type: DiscountType;
}

export interface Fine {
  value: number;
  type: 'FIXED' | 'PERCENTAGE';
}

export interface Interest {
  value: number;
  type: 'FIXED' | 'PERCENTAGE';
}

export interface Split {
  id: string;
  walletId: string;
  fixedValue?: number;
  percentualValue?: number;
  status: string;
  refusalReason: string | null;
  externalReference: string | null;
  description: string | null;
}

export interface Chargeback {
  status: ChargebackStatus;
  reason: string;
}

export interface Payment {
  object: 'payment';
  id: string;
  dateCreated: string;
  customer: string;
  subscription: string;
  installment?: string;
  paymentLink?: string;
  dueDate: string;
  originalDueDate: string;
  value: number;
  netValue: number;
  originalValue: number | null;
  interestValue: number | null;
  nossoNumero: string | null;
  description: string;
  externalReference: string;
  billingType: BillingType;
  status: PaymentStatus;
  pixTransaction: any | null;
  confirmedDate: string;
  paymentDate: string;
  clientPaymentDate: string;
  installmentNumber: number | null;
  creditDate: string;
  custody: any | null;
  estimatedCreditDate: string;
  invoiceUrl: string;
  bankSlipUrl: string | null;
  transactionReceiptUrl: string;
  invoiceNumber: string;
  deleted: boolean;
  anticipated: boolean;
  anticipable: boolean;
  lastInvoiceViewedDate: string | null;
  lastBankSlipViewedDate: string | null;
  postalService: boolean;
  creditCard: CreditCardInfo;
  discount: Discount;
  fine: Fine;
  interest: Interest;
  split: Split[];
  chargeback: Chargeback | null;
  refunds: any | null;
}

export interface AsaasWebhookEvent {
  id: string;
  event:
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_CONFIRMED'
    | 'PAYMENT_OVERDUE'
    | 'PAYMENT_DELETED'
    | 'PAYMENT_RESTORED'
    | 'PAYMENT_REFUNDED'
    | 'PAYMENT_RECEIVED_IN_CASH'
    | 'PAYMENT_CHARGEBACK_REQUESTED'
    | 'PAYMENT_CHARGEBACK_DISPUTE'
    | 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL'
    | 'PAYMENT_DUNNING_REQUESTED'
    | 'PAYMENT_DUNNING_RECEIVED'
    | 'PAYMENT_BANK_SLIP_VIEWED'
    | 'PAYMENT_CHECKOUT_VIEWED';
  dateCreated: string;
  payment: Payment;
}
