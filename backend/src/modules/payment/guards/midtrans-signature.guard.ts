// midtrans-signature.guard.ts - Webhook Signature Verification Guard
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'crypto';
import { Request } from 'express';

@Injectable()
export class MidtransSignatureGuard implements CanActivate {
  private readonly logger = new Logger(MidtransSignatureGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const body = request.body;

    if (!body || !body.signature_key) {
      this.logger.warn('Webhook received without signature');
      throw new UnauthorizedException('Missing signature');
    }

    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY');
    if (!serverKey) {
      this.logger.error('MIDTRANS_SERVER_KEY not configured');
      throw new UnauthorizedException('Server configuration error');
    }

    // Midtrans signature formula: SHA512(order_id + status_code + gross_amount + server_key)
    const signatureData = `${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`;
    const expectedSignature = createHash('sha512')
      .update(signatureData)
      .digest('hex');

    // Timing-safe comparison to prevent timing attacks
    const receivedSignature = body.signature_key;
    
    try {
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');
      const receivedBuffer = Buffer.from(receivedSignature, 'hex');

      if (expectedBuffer.length !== receivedBuffer.length) {
        this.logger.warn(`Invalid signature for order ${body.order_id}`);
        throw new UnauthorizedException('Invalid signature');
      }

      if (!timingSafeEqual(expectedBuffer, receivedBuffer)) {
        this.logger.warn(`Signature mismatch for order ${body.order_id}`);
        throw new UnauthorizedException('Invalid signature');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.warn(`Signature verification error: ${error}`);
      throw new UnauthorizedException('Invalid signature');
    }

    this.logger.log(`Valid signature for order ${body.order_id}`);
    return true;
  }
}
