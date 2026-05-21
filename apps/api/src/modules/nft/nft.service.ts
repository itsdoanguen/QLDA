import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandRecord } from '../database/entities/land-record.entity';
import { LandNFT } from '../database/entities/land-nft.entity';
import { LandFile } from '../database/entities/land-file.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { BlockchainLog } from '../database/entities/blockchain-log.entity';
import { LandRecordStatus } from '../../common/enums/land-record-status.enum';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ConfigService } from '@nestjs/config';
import { IPFS_CLIENT } from '../ipfs/ipfs.constants';
import { IpfsClient, NftMetadata } from '../ipfs/ipfs.types';

@Injectable()
export class NftService {
  private readonly logger = new Logger(NftService.name);

  constructor(
    @InjectRepository(LandRecord)
    private readonly landRecordRepository: Repository<LandRecord>,
    @InjectRepository(LandNFT)
    private readonly landNftRepository: Repository<LandNFT>,
    @InjectRepository(LandFile)
    private readonly landFileRepository: Repository<LandFile>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(BlockchainLog)
    private readonly blockchainLogRepository: Repository<BlockchainLog>,
    private readonly blockchainService: BlockchainService,
    private readonly configService: ConfigService,
    @Inject(IPFS_CLIENT)
    private readonly ipfsClient: IpfsClient,
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

    // 1. Build NFT Metadata & upload to IPFS via Pinata
    const metadataUrl = await this.buildAndUploadMetadata(record);

    // 2. Call Blockchain Service to Mint NFT via LandRegistry (Real on-chain transaction)
    let mintResult: { tokenId: string; txHash: string };
    try {
      mintResult = await this.blockchainService.mintNFT(wallet.walletAddress, metadataUrl);
    } catch (error) {
      this.logger.error(`Failed to mint NFT on-chain for record ${recordId}`, error);
      throw new BadRequestException('Blockchain transaction failed. Please try again.');
    }
    const { tokenId, txHash } = mintResult;

    // 2.5 Sync State Machine: KHOI_TAO -> CHO_DUYET -> DA_CAP_SO
    // Because the off-chain record is already LEADER_SIGNED (fully approved)
    try {
      this.logger.log(`Syncing state machine for token ${tokenId} to DA_CAP_SO...`);
      await this.blockchainService.submitForApproval(tokenId);
      await this.blockchainService.approveLand(tokenId);
    } catch (error) {
      this.logger.error(`Failed to sync state machine on-chain for token ${tokenId}`, error);
      // We don't block the rest of the flow, but it should be logged/alerted
    }

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

  /**
   * Builds ERC-721–compliant NFT metadata from the LandRecord,
   * uploads it as JSON to IPFS (Pinata), and returns the ipfs:// URI.
   */
  private async buildAndUploadMetadata(record: LandRecord): Promise<string> {
    // Look up any attached scan files for the "image" field
    const files = await this.landFileRepository.find({
      where: { recordId: record.id },
      order: { createdAt: 'DESC' },
    });

    // Use the first uploaded file's CID as the NFT image (scan sổ đỏ)
    const imageCid = files.length > 0 ? files[0].ipfsCid : undefined;

    const ownerName = record.owner?.fullName ?? `Owner #${record.ownerId}`;

    const metadata: NftMetadata = {
      name: `Land Record - ${ownerName}`,
      description: `Official Land Registry NFT for property located at ${record.address}`,
      image: imageCid ? `ipfs://${imageCid}` : undefined,
      attributes: [
        { trait_type: 'ownerName', value: ownerName },
        { trait_type: 'location', value: record.address },
        { trait_type: 'area', value: Number(record.area) },
        { trait_type: 'landType', value: record.landType ?? 'N/A' },
        { trait_type: 'plotNumber', value: record.plotNumber ?? 'N/A' },
        { trait_type: 'parcelNumber', value: record.parcelNumber ?? 'N/A' },
        { trait_type: 'recordId', value: record.id },
      ],
    };

    // Upload JSON metadata to IPFS
    const sanitizedName = ownerName.replace(/\s+/g, '_');
    const result = await this.ipfsClient.uploadJson({
      json: metadata as unknown as Record<string, unknown>,
      name: `${sanitizedName}_record_${record.id}_metadata.json`,
    });

    this.logger.log(
      `NFT metadata uploaded to IPFS: CID=${result.cid} (${result.attempts} attempt(s))`,
    );

    return `ipfs://${result.cid}`;
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

  async verifyNft(qrDataOrTokenId: string): Promise<any> {
    let tokenId = qrDataOrTokenId.trim();
    if (tokenId.includes('/verify/')) {
      const parts = tokenId.split('/verify/');
      tokenId = parts[parts.length - 1];
    }

    this.logger.log(`Verifying NFT for input: ${qrDataOrTokenId}, extracted tokenId: ${tokenId}`);

    let ownerOf: string | null = null;
    let tokenURI: string | null = null;
    let onChainExists = false;

    try {
      ownerOf = await this.blockchainService.getNftOwner(tokenId);
      tokenURI = await this.blockchainService.getNftTokenUri(tokenId);
      onChainExists = true;
    } catch (error: any) {
      this.logger.warn(`Token ${tokenId} not found on-chain: ${error.message}`);
    }

    const dbNft = await this.landNftRepository.findOne({
      where: { tokenId },
      relations: ['record', 'record.owner'],
    });

    if (!onChainExists && !dbNft) {
      return {
        qrData: qrDataOrTokenId,
        tokenId,
        isVerified: false,
        message: 'Không tìm thấy thông tin NFT trên Blockchain và hệ thống.',
        blockchain: null,
        database: null,
        comparison: {
          ownerMatches: false,
          metadataMatches: false,
          isAuthentic: false,
        },
        landDetails: null,
      };
    }

    if (onChainExists && !dbNft) {
      return {
        qrData: qrDataOrTokenId,
        tokenId,
        isVerified: false,
        message: 'NFT tồn tại trên Blockchain nhưng không có thông tin trong cơ sở dữ liệu hệ thống.',
        blockchain: {
          tokenId,
          ownerOf,
          tokenURI,
          isValid: true,
        },
        database: null,
        comparison: {
          ownerMatches: false,
          metadataMatches: false,
          isAuthentic: false,
        },
        landDetails: null,
      };
    }

    if (!onChainExists && dbNft) {
      return {
        qrData: qrDataOrTokenId,
        tokenId,
        isVerified: false,
        message: 'NFT có tồn tại trong hệ thống nhưng chưa được đồng bộ hoặc không tồn tại trên Blockchain.',
        blockchain: null,
        database: {
          tokenId: dbNft.tokenId,
          ownerWallet: dbNft.ownerWallet,
          metadataUri: dbNft.metadataUri,
          status: dbNft.status,
          recordId: dbNft.recordId,
        },
        comparison: {
          ownerMatches: false,
          metadataMatches: false,
          isAuthentic: false,
        },
        landDetails: {
          ownerName: dbNft.record?.owner?.fullName ?? 'N/A',
          location: dbNft.record?.address ?? 'N/A',
          area: dbNft.record?.area ? Number(dbNft.record.area) : 0,
          landType: dbNft.record?.landType ?? 'N/A',
          plotNumber: dbNft.record?.plotNumber ?? 'N/A',
          parcelNumber: dbNft.record?.parcelNumber ?? 'N/A',
        },
      };
    }

    if (!dbNft) {
      // Should not happen as handled by early return, but satisfies TS compiler
      return {
        qrData: qrDataOrTokenId,
        tokenId,
        isVerified: false,
        message: 'Lỗi đồng bộ dữ liệu hệ thống.',
        blockchain: null,
        database: null,
        comparison: {
          ownerMatches: false,
          metadataMatches: false,
          isAuthentic: false,
        },
        landDetails: null,
      };
    }

    // Both on-chain and database exist
    const ownerMatches = ownerOf?.toLowerCase() === dbNft.ownerWallet?.toLowerCase();
    const metadataMatches = tokenURI === dbNft.metadataUri;
    const isAuthentic = ownerMatches && metadataMatches;

    let message = 'Xác thực thành công. Dữ liệu trên blockchain trùng khớp hoàn toàn với hệ thống.';
    if (!isAuthentic) {
      if (!ownerMatches && !metadataMatches) {
        message = 'Cảnh báo: Cả chủ sở hữu và nội dung Metadata đều không trùng khớp với Blockchain.';
      } else if (!ownerMatches) {
        message = 'Cảnh báo: Địa chỉ ví chủ sở hữu trên Blockchain không trùng khớp với hệ thống.';
      } else {
        message = 'Cảnh báo: Nội dung Metadata/IPFS URI trên Blockchain không trùng khớp với hệ thống.';
      }
    }

    return {
      qrData: qrDataOrTokenId,
      tokenId,
      isVerified: isAuthentic,
      message,
      blockchain: {
        tokenId,
        ownerOf,
        tokenURI,
        isValid: true,
      },
      database: {
        tokenId: dbNft.tokenId,
        ownerWallet: dbNft.ownerWallet,
        metadataUri: dbNft.metadataUri,
        status: dbNft.status,
        recordId: dbNft.recordId,
      },
      comparison: {
        ownerMatches,
        metadataMatches,
        isAuthentic,
      },
      landDetails: {
        ownerName: dbNft.record?.owner?.fullName ?? 'N/A',
        location: dbNft.record?.address ?? 'N/A',
        area: dbNft.record?.area ? Number(dbNft.record.area) : 0,
        landType: dbNft.record?.landType ?? 'N/A',
        plotNumber: dbNft.record?.plotNumber ?? 'N/A',
        parcelNumber: dbNft.record?.parcelNumber ?? 'N/A',
      },
    };
  }
}
