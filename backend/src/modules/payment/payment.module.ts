// payment.module.ts - Payment Module with Midtrans Integration
import { Module, forwardRef } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { MidtransSignatureGuard } from './guards/midtrans-signature.guard';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [forwardRef(() => OrderModule)],
  controllers: [PaymentController],
  providers: [PaymentService, MidtransSignatureGuard],
  exports: [PaymentService],
})
export class PaymentModule {}
