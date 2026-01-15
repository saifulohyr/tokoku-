// main.ts - Application Bootstrap with Security Configuration
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000';
  const isProduction = process.env.NODE_ENV === 'production';

  // ============================================
  // SECURITY MIDDLEWARE
  // ============================================

  // Helmet - Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? undefined
        : {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'"],
              imgSrc: ["'self'", 'data:', 'https:'],
            },
          },
      crossOriginEmbedderPolicy: false, // Required for Swagger UI
    }),
  );

  // CORS Configuration
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  // Request Size Limits
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '10mb' }));

  // ============================================
  // SWAGGER API DOCUMENTATION
  // ============================================
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('TOKOku API')
      .setDescription(
        `
## Distributed E-commerce Backend API

This API implements a **Modular Monolith** architecture with distributed systems patterns:

### Features
- 🔐 **JWT Authentication** - Secure user registration and login
- 📦 **Product Management** - CRUD operations with atomic stock updates
- 🛒 **Order Orchestration** - Saga pattern with compensation logic
- 💳 **Payment Integration** - Midtrans Snap API + Mock mode for testing
- 🔔 **Event-Driven Notifications** - Async order status updates

### Distributed Systems Patterns
- **Atomic Stock Updates** - Prevent race conditions with SQL-level locking
- **Saga Pattern** - Order orchestration with rollback on failure
- **Rate Limiting** - Protect against DDoS and brute force attacks
- **Eventual Consistency** - Stock restoration on payment failures
      `,
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Authentication', 'User registration and login')
      .addTag('Products', 'Product catalog management')
      .addTag('Orders', 'Order creation and management')
      .addTag('Payment', 'Payment processing and webhooks')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    });

    logger.log(`📚 Swagger documentation available at http://localhost:${port}/api/docs`);
  }

  // ============================================
  // START SERVER
  // ============================================
  await app.listen(port);

  logger.log(`🚀 Application running on http://localhost:${port}`);
  logger.log(`🌐 CORS enabled for: ${corsOrigin}`);
  logger.log(`🔒 Security headers enabled via Helmet`);
  logger.log(`⏱️  Rate limiting active`);

  if (configService.get<string>('MIDTRANS_SERVER_KEY')) {
    logger.log(`💳 Midtrans integration: ${configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true' ? 'PRODUCTION' : 'SANDBOX'}`);
  } else {
    logger.warn(`💳 Midtrans not configured - using mock payment mode`);
  }
}

bootstrap();
