import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('smart_contracts')
export class SmartContract {
  @PrimaryColumn({ name: 'contract_address' })
  contractAddress: string;

  @Column({ length: 255 })
  name: string; // Core, NFT, Multi-sig, etc.

  @Column({ type: 'text' })
  abi: string;

  @Column({ length: 50, nullable: true })
  version: string;

  @Column({ length: 50, default: 'Active' })
  status: string; // Active, Paused

  @Column({ name: 'deployed_at', type: 'timestamp', nullable: true })
  deployedAt: Date;
}
