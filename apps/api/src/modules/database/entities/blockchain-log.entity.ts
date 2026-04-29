import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('blockchain_logs')
export class BlockchainLog {
  @PrimaryColumn({ name: 'tx_hash' })
  txHash: string;

  @Column({ name: 'action_type', length: 100 })
  actionType: string; // Mint_NFT, Transfer, Multi-sig, etc.

  @Column({ name: 'gas_fee', type: 'decimal', precision: 20, scale: 10, nullable: true })
  gasFee: number;

  @Column({ length: 50 })
  status: string; // Success, Reverted, Out_Of_Gas

  @Column({ type: 'timestamp' })
  timestamp: Date;
}
