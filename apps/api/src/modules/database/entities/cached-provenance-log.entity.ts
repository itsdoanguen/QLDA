import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BlockchainLog } from './blockchain-log.entity';
import { LandNFT } from './land-nft.entity';

@Entity('cached_provenance_logs')
export class CachedProvenanceLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LandNFT)
  @JoinColumn({ name: 'token_id' })
  nft: LandNFT;

  @Column({ name: 'token_id' })
  tokenId: string;

  @Column({ name: 'event_type', length: 100 })
  eventType: string; // Transfer, Area_Change, Dispute_Resolved

  @Column({ name: 'event_data', type: 'text' })
  eventData: string; // JSON chứa chi tiết event từ Blockchain

  @ManyToOne(() => BlockchainLog)
  @JoinColumn({ name: 'tx_hash' })
  transaction: BlockchainLog;

  @Column({ name: 'tx_hash' })
  txHash: string;

  @Column({ name: 'block_number' })
  blockNumber: number;

  @CreateDateColumn({ name: 'cached_at' })
  cachedAt: Date;
}
