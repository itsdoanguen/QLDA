import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { VneidService } from '../vneid/vneid.service';
import { RedisSessionService } from '../redis/redis-session.service';
import { WalletService } from '../wallet/wallet.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let vneidService: Partial<VneidService>;
  let redisSessionService: Partial<RedisSessionService>;
  let walletService: Partial<WalletService>;
  let jwtService: Partial<JwtService>;
  let configService: Partial<ConfigService>;
  let userRepository: any;
  let roleRepository: any;

  beforeEach(async () => {
    vneidService = {
      startAuth: jest.fn(),
      verifyAuth: jest.fn(),
      resendOtp: jest.fn(),
      logoutAuth: jest.fn(),
    };
    redisSessionService = {
      setSession: jest.fn(),
      getSession: jest.fn(),
      blacklistToken: jest.fn(),
    };
    walletService = {
      ensureManagedWallet: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
      decode: jest.fn(),
    };
    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
        if (key === 'JWT_ACCESS_SECRET') return 'test_secret';
        return null;
      }),
    };
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    roleRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: VneidService, useValue: vneidService },
        { provide: RedisSessionService, useValue: redisSessionService },
        { provide: WalletService, useValue: walletService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Role), useValue: roleRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('1. Happy Path', () => {
    it('TC-H01: should login and return challengeId, then cache data to Redis', async () => {
      const payload = { nationalId: '123456789', fullName: 'Nguyen Van A', dateOfBirth: '01/01/1990' };
      const vneidResult = { challengeId: 'challenge_123', person: { fullName: 'Nguyen Van A', dateOfBirth: '01/01/1990' } };
      
      (vneidService.startAuth as jest.Mock).mockResolvedValue(vneidResult);

      const result = await service.login(payload);

      expect(vneidService.startAuth).toHaveBeenCalledWith(payload);
      expect(redisSessionService.setSession).toHaveBeenCalledWith(
        'auth_flow_challenge_123',
        expect.any(String),
        300
      );
      expect(result).toEqual(vneidResult);
    });

    it('TC-H02: should verify OTP for new user, create user and return access token', async () => {
      const payload = { challengeId: 'challenge_123', otp: '123456' };
      const vneidVerifyResult = { accessToken: 'vneid_token', nationalId: '123456789' };
      
      (vneidService.verifyAuth as jest.Mock).mockResolvedValue(vneidVerifyResult);
      (redisSessionService.getSession as jest.Mock).mockReturnValue(JSON.stringify({ fullName: 'Nguyen Van A' }));
      
      // User not found
      userRepository.findOne.mockResolvedValue(null);
      // Role not found
      roleRepository.findOne.mockResolvedValue(null);
      
      roleRepository.create.mockReturnValue({ id: 1, roleCode: 'CITIZEN' });
      roleRepository.save.mockResolvedValue({ id: 1, roleCode: 'CITIZEN' });
      
      userRepository.create.mockReturnValue({ id: 1, vneidNumber: '123456789', fullName: 'Nguyen Van A', status: 'Active', roleId: 1 });
      userRepository.save.mockResolvedValue({ id: 1, vneidNumber: '123456789', fullName: 'Nguyen Van A', status: 'Active', roleId: 1 });
      
      (jwtService.signAsync as jest.Mock).mockResolvedValue('internal_jwt_token');
      (jwtService.decode as jest.Mock).mockReturnValue({ jti: 'jwt_id' });

      const result = await service.verifyOtp(payload);

      expect(vneidService.verifyAuth).toHaveBeenCalledWith(payload);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { vneidNumber: '123456789' } });
      expect(roleRepository.findOne).toHaveBeenCalledWith({ where: { roleCode: 'CITIZEN' } });
      expect(roleRepository.save).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(redisSessionService.setSession).toHaveBeenCalledWith('jwt_id', JSON.stringify({ userId: 1 }), 900);
      
      expect(result).toEqual({
        accessToken: 'internal_jwt_token',
        tokenType: 'Bearer',
        expiresIn: 900,
        user: { id: 1, fullName: 'Nguyen Van A', vneidNumber: '123456789' },
      });
    });

    it('TC-H03: should verify OTP for existing active user and return access token without creating new user', async () => {
      const payload = { challengeId: 'challenge_123', otp: '123456' };
      const vneidVerifyResult = { accessToken: 'vneid_token', nationalId: '123456789' };
      
      (vneidService.verifyAuth as jest.Mock).mockResolvedValue(vneidVerifyResult);
      (redisSessionService.getSession as jest.Mock).mockReturnValue(JSON.stringify({ fullName: 'Nguyen Van A' }));
      
      // User found and active
      userRepository.findOne.mockResolvedValue({ id: 2, vneidNumber: '123456789', fullName: 'Existing User', status: 'Active', roleId: 1 });
      
      (jwtService.signAsync as jest.Mock).mockResolvedValue('internal_jwt_token_2');
      (jwtService.decode as jest.Mock).mockReturnValue({ jti: 'jwt_id_2' });

      const result = await service.verifyOtp(payload);

      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
      
      expect(result).toEqual({
        accessToken: 'internal_jwt_token_2',
        tokenType: 'Bearer',
        expiresIn: 900,
        user: { id: 2, fullName: 'Existing User', vneidNumber: '123456789' },
      });
    });

    it('TC-H04: should send OTP (resend) successfully', async () => {
      const payload = { challengeId: 'challenge_123' };
      (vneidService.resendOtp as jest.Mock).mockResolvedValue({ success: true });
      
      const result = await service.sendOtp(payload);
      expect(vneidService.resendOtp).toHaveBeenCalledWith('challenge_123');
      expect(result).toEqual({ success: true });
    });

    it('TC-H05: should logout successfully, blacklist token and revoke sandbox auth', async () => {
      const userPayload = { vneidAccessToken: 'sandbox_jti' };
      const authHeader = 'Bearer internal_jwt_token';
      
      const result = await service.logout(userPayload, authHeader);
      
      expect(redisSessionService.blacklistToken).toHaveBeenCalledWith('internal_jwt_token', 900);
      expect(vneidService.logoutAuth).toHaveBeenCalledWith('sandbox_jti');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('2. Sad Path', () => {
    it('TC-S01: should throw UnauthorizedException on invalid OTP or expired challengeId', async () => {
      const payload = { challengeId: 'invalid_challenge', otp: 'wrong_otp' };
      // Simulate session exists
      (redisSessionService.getSession as jest.Mock).mockReturnValue(JSON.stringify({ fullName: 'Unknown' }));
      // Simulate VNeID verification failure
      (vneidService.verifyAuth as jest.Mock).mockResolvedValue(null);

      await expect(service.verifyOtp(payload)).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyOtp(payload)).rejects.toThrow('Invalid OTP or Challenge');
    });

    it('TC-S02: should throw UnauthorizedException if existing user account is locked/inactive', async () => {
      const payload = { challengeId: 'challenge_123', otp: '123456' };
      const vneidVerifyResult = { accessToken: 'vneid_token', nationalId: '123456789' };
      
      (vneidService.verifyAuth as jest.Mock).mockResolvedValue(vneidVerifyResult);
      (redisSessionService.getSession as jest.Mock).mockReturnValue(JSON.stringify({ fullName: 'Nguyen Van A' }));
      
      // User found but inactive
      userRepository.findOne.mockResolvedValue({ id: 2, vneidNumber: '123456789', fullName: 'Existing User', status: 'Inactive', roleId: 1 });
      
      await expect(service.verifyOtp(payload)).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyOtp(payload)).rejects.toThrow('User account is locked or inactive');
    });

    it('TC-S03-Sub: should throw UnauthorizedException when getting profile for non-existent user', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.getProfile(999)).rejects.toThrow(UnauthorizedException);
      await expect(service.getProfile(999)).rejects.toThrow('User not found');
    });

    it('TC-S04: should throw TooManyRequestsException or block account when entering OTP incorrectly too many times', async () => {
      const payload = { challengeId: 'challenge_123', otp: 'wrong_otp' };
      
      // Simulate that the user has reached the maximum allowed failed attempts in Redis
      (redisSessionService.getSession as jest.Mock).mockImplementation((key) => {
        if (key === 'otp_attempts_challenge_123') return '5'; // max attempts reached
        return null;
      });

      // Expect the service to throw an exception due to too many failed attempts
      // Note: Implementation might not exist yet, this is TDD
      await expect(service.verifyOtp(payload)).rejects.toThrow(/Too many .* attempts/i);
    });

    it('TC-S05: should throw UnauthorizedException when using an expired OTP', async () => {
      const payload = { challengeId: 'challenge_123', otp: '123456' };
      
      // Simulate that the OTP session has expired (Redis returns null for the challengeId)
      (redisSessionService.getSession as jest.Mock).mockImplementation((key) => {
        if (key === 'auth_flow_challenge_123') return null; // Expired or does not exist
        return null;
      });

      // Expect the service to throw an exception for expired OTP
      await expect(service.verifyOtp(payload)).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyOtp(payload)).rejects.toThrow(/expired/i);
    });
  });
});
