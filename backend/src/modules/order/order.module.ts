// order.module.ts - Order Module (Saga Orchestrator)
import { Module, forwardRef } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ProductModule } from '../product/product.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [ProductModule, forwardRef(() => PaymentModule)],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
