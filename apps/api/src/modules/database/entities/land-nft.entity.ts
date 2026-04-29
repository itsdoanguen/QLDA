import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { BlockchainLog } from './blockchain-log.entity';
import { LandRecord } from './land-record.entity';
import { SmartContract } from './smart-contract.entity';
import { Wallet } from './wallet.entity';

@Entity('land_nfts')
export class LandNFT {
  @PrimaryColumn({ name: 'token_id' })
  tokenId: string;

  @OneToOne(() => LandRecord)
  @JoinColumn({ name: 'record_id' })
  record: LandRecord;

  @Column({ name: 'record_id' })
  recordId: number;

  @ManyToOne(() => SmartContract)
  @JoinColumn({ name: 'contract_address' })
  contract: SmartContract;

  @Column({ name: 'contract_address' })
  contractAddress: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'owner_wallet' })
  owner: Wallet;

  @Column({ name: 'owner_wallet' })
  ownerWallet: string;

  @Column({ name: 'metadata_uri', type: 'text' })
  metadataUri: string;

  @Column({ name: 'qr_code', length: 255, unique: true, nullable: true })
  qrCode: string;

  @OneToOne(() => BlockchainLog)
  @JoinColumn({ name: 'mint_tx_hash' })
  mintTx: BlockchainLog;

  @Column({ name: 'mint_tx_hash', nullable: true })
  mintTxHash: string;

  @Column({ length: 50, default: 'Normal' })
  status: string; // Normal, Trading, Locked

  @CreateDateColumn({ name: 'mint_date' })
  mintDate: Date;
}
