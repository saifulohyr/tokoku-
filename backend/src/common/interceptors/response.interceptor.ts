// response.interceptor.ts - Transform Responses to Standardized Envelope
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has success property, pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        return {
          success: true as const,
          data,
          message: 'Success',
        };
      }),
    );
  }
}
