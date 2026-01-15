// zod-validation.pipe.ts - Custom Validation Pipe with Zod Integration and XSS Protection
import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';
import { sanitizeObject } from '../utils/sanitize.util';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  private schema: ZodSchema;

  constructor(schema: ZodSchema) {
    this.schema = schema;
  }

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      // Step 1: Sanitize all string inputs to prevent XSS
      const sanitizedValue = sanitizeObject(value);

      // Step 2: Validate with Zod schema
      const result = this.schema.parse(sanitizedValue);
      return result;
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        throw new BadRequestException({
          message: formattedErrors,
          error: 'Validation failed',
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}

// Helper function to create validation pipe for a schema
export const zodValidate = (schema: ZodSchema) => new ZodValidationPipe(schema);

