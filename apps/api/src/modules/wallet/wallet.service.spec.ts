import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from '../database/entities/wallet.entity';
import { WalletRecoveryRequest } from '../database/entities/wallet-recovery-request.entity';
import { User } from '../database/entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('WalletService - CCCD Constraints', () => {
  let service: WalletService;
  let walletRepository: any;
  let recoveryRepository: any;
  let userRepository: any;

  beforeEach(async () => {
    walletRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    recoveryRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    userRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getRepositoryToken(Wallet), useValue: walletRepository },
        { provide: getRepositoryToken(WalletRecoveryRequest), useValue: recoveryRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  describe('linkWallet', () => {
    it('should link a wallet successfully when CCCD and wallet address are unlinked', async () => {
      userRepository.findOne.mockResolvedValue({ id: 1, vneidNumber: '012345678912', status: 'Active' });
      walletRepository.findOne.mockResolvedValue(null);
      walletRepository.create.mockReturnValue({ walletAddress: '0x123', userId: 1, status: 'Active' });
      walletRepository.save.mockResolvedValue({ walletAddress: '0x123', userId: 1, status: 'Active' });

      const result = await service.linkWallet(1, { walletAddress: '0x123' });

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(walletRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Wallet linked successfully' });
    });

    it('should throw NotFoundException if User does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.linkWallet(99, { walletAddress: '0x123' }))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw BadRequestException if the CCCD is already linked to a wallet', async () => {
      userRepository.findOne.mockResolvedValue({ id: 1, vneidNumber: '012345678912', status: 'Active' });
      
      walletRepository.findOne.mockImplementation(({ where }: any) => {
        if (where.userId === 1) return Promise.resolve({ walletAddress: '0x456', userId: 1 });
        return Promise.resolve(null);
      });

      await expect(service.linkWallet(1, { walletAddress: '0x123' }))
        .rejects
        .toThrow('CCCD 012345678912 is already linked to a wallet');
    });

    it('should throw BadRequestException if the wallet address is already linked to another CCCD', async () => {
      userRepository.findOne.mockResolvedValue({ id: 2, vneidNumber: '987654321098', status: 'Active' });
      
      walletRepository.findOne.mockImplementation(({ where }: any) => {
        if (where.userId === 2) return Promise.resolve(null);
        if (where.walletAddress === '0x123') return Promise.resolve({ walletAddress: '0x123', userId: 1 });
        return Promise.resolve(null);
      });

      await expect(service.linkWallet(2, { walletAddress: '0x123' }))
        .rejects
        .toThrow('Wallet address is already linked to another CCCD');
    });
  });

  describe('ensureManagedWallet', () => {
    it('should auto-create a wallet if the CCCD does not have one', async () => {
      userRepository.findOne.mockResolvedValue({ id: 1, vneidNumber: '012345678912' });
      walletRepository.findOne.mockResolvedValue(null);
      walletRepository.create.mockReturnValue({ walletAddress: '0xAuto', userId: 1, status: 'Active' });
      walletRepository.save.mockResolvedValue({ walletAddress: '0xAuto', userId: 1, status: 'Active' });

      // Mock ethers if used inside ensureManagedWallet, or assume basic mock works
      const result = await service.ensureManagedWallet(1);
      
      expect(result.walletAddress).toBeDefined();
      expect(walletRepository.save).toHaveBeenCalled();
    });

    it('should return the existing wallet if the CCCD already has one without creating a new one', async () => {
      userRepository.findOne.mockResolvedValue({ id: 1, vneidNumber: '012345678912' });
      walletRepository.findOne.mockResolvedValue({ walletAddress: '0xExisting', userId: 1, status: 'Active' });
      
      const result = await service.ensureManagedWallet(1);
      
      expect(walletRepository.create).not.toHaveBeenCalled();
      expect(walletRepository.save).not.toHaveBeenCalled();
      expect(result.walletAddress).toBe('0xExisting');
    });
  });
});
