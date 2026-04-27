import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VneidService } from '../vneid/vneid.service';
import { RedisSessionService } from '../redis/redis-session.service';
import { User } from '../database/entities/user.entity';
import { AppEnv } from '../../config/env/env.schema';
import {
  AuthLoginRequest,
  AuthVerifyOtpRequest,
  AuthSendOtpRequest,
  AuthLogoutRequest,
} from '@land-registry/shared-types';

@Injectable()
export class AuthService {
  constructor(
    private vneidService: VneidService,
    private redisSession: RedisSessionService,
    private jwtService: JwtService,
    private configService: ConfigService<AppEnv>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async login(payload: AuthLoginRequest) {
    // 1. Call VNeID to start auth and get challengeId
    const result = await this.vneidService.startAuth(payload);
    
    // The VNeID sandbox returns challengeId, expiresAt, and optionally _testOtp
    // We cache fullName and dob for user creation in step 2 (verifyOtp)
    if (result && result.challengeId) {
      this.redisSession.setSession(
        `auth_flow_${result.challengeId}`, 
        JSON.stringify(payload), 
        300 // 5 minutes TTL
      );
    }
    return result;
  }

  async verifyOtp(payload: AuthVerifyOtpRequest) {
    // 1. Verify OTP with VNeID sandbox
    const result = await this.vneidService.verifyAuth(payload);
    
    if (!result || !result.accessToken) {
      throw new UnauthorizedException('Invalid OTP or Challenge');
    }

    // 2. Fetch cached payload for fullName
    const cachedStr = this.redisSession.getSession(`auth_flow_${payload.challengeId}`);
    let fullName = 'Unknown';
    if (cachedStr) {
      const cachedPayload: AuthLoginRequest = JSON.parse(cachedStr);
      fullName = cachedPayload.fullName;
    }

    const nationalId = result.nationalId;

    // 3. Find or Create User
    let user = await this.userRepository.findOne({ where: { vneidNumber: nationalId } });
    if (!user) {
      user = this.userRepository.create({
        vneidNumber: nationalId,
        fullName: fullName,
        status: 'Active',
      });
      user = await this.userRepository.save(user);
    } else if (user.status !== 'Active') {
      throw new UnauthorizedException('User account is locked or inactive');
    }

    // 4. Generate internal JWT
    const internalPayload = { sub: user.id, nationalId: user.vneidNumber };
    const jwtExpiry = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const accessToken = await this.jwtService.signAsync(internalPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: jwtExpiry as any, // StringValue; cast required by @nestjs/jwt overload
    });

    const decoded = this.jwtService.decode(accessToken) as any;
    const jti = decoded?.jti || Date.now().toString(); // If we add jti to payload

    // 5. Store session
    const ttlStr = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const ttlSeconds = parseInt(ttlStr) * 60; // rudimentary parsing
    this.redisSession.setSession(jti, JSON.stringify({ userId: user.id }), ttlSeconds || 900);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: ttlSeconds || 900,
      user: {
        id: user.id,
        fullName: user.fullName,
        vneidNumber: user.vneidNumber,
      }
    };
  }

  async sendOtp(payload: AuthSendOtpRequest) {
    return this.vneidService.resendOtp(payload.challengeId);
  }

  async logout(payload: AuthLogoutRequest, authHeader?: string) {
    // Basic logic to blacklist token
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      this.redisSession.blacklistToken(token, 900); // 15 mins
    }
    
    // Optionally call VNeID logout if they gave us a sandbox jti
    // but our AuthLogoutRequest doesn't strictly have sandbox jti right now
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      vneidNumber: user.vneidNumber,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      status: user.status,
    };
  }
}
