import { Injectable, UnauthorizedException, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VneidService } from '../vneid/vneid.service';
import { RedisSessionService } from '../redis/redis-session.service';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { AppEnv } from '../../config/env/env.schema';
import {
  AuthLoginRequest,
  AuthVerifyOtpRequest,
  AuthSendOtpRequest,
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
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async login(payload: AuthLoginRequest) {
    // 1. Call VNeID to start auth and get challengeId
    const result = await this.vneidService.startAuth(payload);
    
    // The VNeID sandbox returns challengeId, expiresAt, and optionally _testOtp and person
    // We cache fullName and dob for user creation in step 2 (verifyOtp)
    if (result && result.challengeId) {
      const sessionData = {
        ...payload,
        fullName: result.person?.fullName || (payload as any).fullName,
        dateOfBirth: result.person?.dateOfBirth || (payload as any).dateOfBirth,
      };

      this.redisSession.setSession(
        `auth_flow_${result.challengeId}`, 
        JSON.stringify(sessionData), 
        300 // 5 minutes TTL
      );
    }
    return result;
  }

  private readonly logger = new Logger(AuthService.name);

  async verifyOtp(payload: AuthVerifyOtpRequest) {
    try {
      this.logger.log(`Verifying OTP for challenge: ${payload.challengeId}`);

      // 1. Check max attempts
      const attemptsKey = `otp_attempts_${payload.challengeId}`;
      const attemptsStr = this.redisSession.getSession(attemptsKey);
      const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
      if (attempts >= 5) {
        throw new HttpException('Too many OTP attempts', HttpStatus.TOO_MANY_REQUESTS);
      }

      // 2. Check if OTP flow session expired
      const sessionKey = `auth_flow_${payload.challengeId}`;
      const cachedStr = this.redisSession.getSession(sessionKey);
      if (!cachedStr) {
        throw new UnauthorizedException('OTP has expired');
      }

      // 3. Verify OTP with VNeID sandbox
      const result = await this.vneidService.verifyAuth(payload);
      
      this.logger.log(`Sandbox verification result: ${JSON.stringify(result)}`);

      if (!result || !result.accessToken) {
        this.redisSession.setSession(attemptsKey, (attempts + 1).toString(), 300);
        throw new UnauthorizedException('Invalid OTP or Challenge');
      }

      // 4. Fetch cached payload for fullName
      let fullName = 'Unknown';
      if (cachedStr) {
        const cachedPayload: any = JSON.parse(cachedStr);
        fullName = cachedPayload.fullName || 'Unknown';
      }

      const nationalId = result.nationalId;
      this.logger.log(`National ID from sandbox: ${nationalId}`);

      // 3. Find or Create User
      let user = await this.userRepository.findOne({ where: { vneidNumber: nationalId } });
      if (!user) {
        this.logger.log(`Creating new user for national ID: ${nationalId}`);

        // Find default citizen role
        let role = await this.roleRepository.findOne({ where: { roleCode: 'CITIZEN' } });
        if (!role) {
          this.logger.log('Citizen role not found, creating it...');
          role = this.roleRepository.create({
            roleCode: 'CITIZEN',
            roleName: 'Citizen',
            description: 'Default role for citizens logging in via VNeID',
          });
          role = await this.roleRepository.save(role);
        }

        user = this.userRepository.create({
          vneidNumber: nationalId,
          fullName: fullName,
          status: 'Active',
          roleId: role.id,
        });
        user = await this.userRepository.save(user);
        this.logger.log(`User created with ID: ${user.id}`);
      } else if (user.status !== 'Active') {
        throw new UnauthorizedException('User account is locked or inactive');
      }

      // 4. Generate internal JWT
      this.logger.log(`Generating internal JWT for user: ${user.id}`);
      const internalPayload = { 
        sub: user.id, 
        nationalId: user.vneidNumber,
        vneidAccessToken: result.accessToken // Mapping sandbox token here
      };
      const jwtExpiry = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
      const accessToken = await this.jwtService.signAsync(internalPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: jwtExpiry as any,
      });

      const decoded = this.jwtService.decode(accessToken) as any;
      const jti = decoded?.jti || Date.now().toString();

      // 5. Store session
      const ttlStr = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
      const ttlSeconds = parseInt(ttlStr) * 60;
      this.redisSession.setSession(jti, JSON.stringify({ userId: user.id }), ttlSeconds || 900);

      this.logger.log(`Login successful for user: ${user.vneidNumber}`);

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
    } catch (error: any) {
      this.logger.error(`Error in verifyOtp: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { message: 'Internal Server Error during OTP verification', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async sendOtp(payload: AuthSendOtpRequest) {
    return this.vneidService.resendOtp(payload.challengeId);
  }

  async logout(userPayload: any, authHeader?: string) {
    // 1. Blacklist internal token (in-memory)
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      this.redisSession.blacklistToken(token, 900); // 15 mins
      this.logger.log(`Internal token blacklisted: ${token.substring(0, 10)}...`);
    }
    
    // 2. Automatically revoke VNeID sandbox session from mapped token in JWT
    const sandboxJti = userPayload.vneidAccessToken;
    if (sandboxJti) {
      try {
        await this.vneidService.logoutAuth(sandboxJti);
        this.logger.log(`VNeID sandbox session automatically revoked: ${sandboxJti}`);
      } catch (error: any) {
        this.logger.warn(`Failed to revoke VNeID sandbox session: ${error.message}`);
      }
    }

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
