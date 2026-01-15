declare module 'midtrans-client' {
  export interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  }

  export interface CoreApiOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  }

  export interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface CreateTransactionParameter {
    transaction_details: TransactionDetails;
    credit_card?: {
      secure?: boolean;
    };
    customer_details?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    };
    item_details?: Array<{
      id?: string;
      price: number;
      quantity: number;
      name: string;
    }>;
  }

  export interface CreateTransactionResponse {
    token: string;
    redirect_url: string;
  }

  export interface TransactionStatusResponse {
    transaction_status: string;
    transaction_id: string;
    status_code: string;
    status_message: string;
    order_id: string;
    payment_type: string;
    gross_amount: string;
    fraud_status?: string;
  }

  export class Snap {
    constructor(options: SnapOptions);
    createTransaction(parameter: CreateTransactionParameter): Promise<CreateTransactionResponse>;
  }

  export class CoreApi {
    constructor(options: CoreApiOptions);
    transaction: {
      status(orderId: string): Promise<TransactionStatusResponse>;
    };
  }
}
