import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { RedisSessionService } from '../redis/redis-session.service';
import { AppEnv } from '../../config/env/env.schema';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<AppEnv>,
    private redisSession: RedisSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      this.logger.warn(`No token found in request to ${request.url}`);
      throw new UnauthorizedException();
    }
    
    if (this.redisSession.isTokenBlacklisted(token)) {
      this.logger.warn(`Token is blacklisted`);
      throw new UnauthorizedException('Token has been revoked');
    }

    try {
      const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });
      request['user'] = payload;
      this.logger.log(`User ${payload.sub} authenticated successfully`);
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      throw new UnauthorizedException();
    }
    return true;
  }


  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
