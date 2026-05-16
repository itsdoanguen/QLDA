import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandRecord } from '../database/entities/land-record.entity';
import { LandNFT } from '../database/entities/land-nft.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { BlockchainLog } from '../database/entities/blockchain-log.entity';
import { LandRecordStatus } from '../../common/enums/land-record-status.enum';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NftService {
  private readonly logger = new Logger(NftService.name);

  constructor(
    @InjectRepository(LandRecord)
    private readonly landRecordRepository: Repository<LandRecord>,
    @InjectRepository(LandNFT)
    private readonly landNftRepository: Repository<LandNFT>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(BlockchainLog)
    private readonly blockchainLogRepository: Repository<BlockchainLog>,
    private readonly blockchainService: BlockchainService,
    private readonly configService: ConfigService,
  ) {}

  async mint(recordId: number): Promise<LandNFT> {
    const record = await this.landRecordRepository.findOne({ 
      where: { id: recordId },
      relations: ['owner']
    });
    
    if (!record) {
      throw new NotFoundException('Land record not found');
    }

    if (record.status !== LandRecordStatus.LEADER_SIGNED) {
      throw new BadRequestException('Record must be signed by Lãnh đạo before minting');
    }

    // Check if already minted
    const existingNft = await this.landNftRepository.findOne({ where: { recordId } });
    if (existingNft) {
      throw new BadRequestException('NFT already exists for this record');
    }

    // Get owner wallet
    const wallet = await this.walletRepository.findOne({ where: { userId: record.ownerId } });
    if (!wallet) {
      throw new BadRequestException('Owner does not have a wallet registered');
    }

    this.logger.log(`Starting minting process for Record ${recordId}`);

    // 1. Prepare Metadata (IPFS URL - will be updated when Pinata is fully integrated)
    const metadataUrl = `ipfs://placeholder_metadata_${recordId}`;

    // 2. Call Blockchain Service to Mint NFT via LandRegistry (Real on-chain transaction)
    let mintResult: { tokenId: string; txHash: string };
    try {
      mintResult = await this.blockchainService.mintNFT(wallet.walletAddress, metadataUrl);
    } catch (error) {
      this.logger.error(`Failed to mint NFT on-chain for record ${recordId}`, error);
      throw new BadRequestException('Blockchain transaction failed. Please try again.');
    }
    const { tokenId, txHash } = mintResult;

    // 3. Create Blockchain Log
    const log = this.blockchainLogRepository.create({
      txHash,
      actionType: 'Mint_NFT',
      status: 'Success',
      timestamp: new Date(),
    });
    await this.blockchainLogRepository.save(log);

    // 4. Generate QR Code URL
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://landregistry.gov.vn/verify/${tokenId}`;

    // 5. Create Land NFT record
    const nft = this.landNftRepository.create({
      tokenId,
      recordId,
      contractAddress: this.configService.get('LAND_NFT_CONTRACT_ADDRESS'),
      ownerWallet: wallet.walletAddress,
      metadataUri: metadataUrl,
      mintTxHash: txHash,
      qrCode,
      status: 'Normal',
      mintDate: new Date(),
    });
    const savedNft = await this.landNftRepository.save(nft);

    // 6. Update Land Record status
    record.status = LandRecordStatus.MINTED;
    await this.landRecordRepository.save(record);

    return savedNft;
  }

  async getByTokenId(tokenId: string): Promise<LandNFT> {
    const nft = await this.landNftRepository.findOne({ 
      where: { tokenId },
      relations: ['record', 'record.owner']
    });
    if (!nft) {
      throw new NotFoundException('NFT not found');
    }
    return nft;
  }

  async getByOwner(walletAddress: string): Promise<LandNFT[]> {
    return this.landNftRepository.find({
      where: { ownerWallet: walletAddress },
      relations: ['record'],
    });
  }
}
