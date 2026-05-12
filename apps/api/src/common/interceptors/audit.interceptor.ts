import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip, user } = request;

    // Only log write operations
    const isWriteOperation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    
    // Skip some routes that are too noisy or sensitive (e.g. login)
    const isSensitive = url.includes('auth/login') || url.includes('auth/otp');

    if (!isWriteOperation || isSensitive) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        try {
          // Extract target table and ID from URL if possible, or use data from response
          const urlParts = url.split('/');
          const targetTable = urlParts[2] || 'unknown';
          const targetId = data?.id?.toString() || urlParts[3] || 'unknown';

          await this.auditService.createLog({
            userId: user?.sub,
            action: `${method} ${url}`,
            targetTable,
            targetId,
            ipAddress: ip,
          });
        } catch (error) {
          this.logger.error('Failed to create audit log', error.stack);
        }
      }),
    );
  }
}
