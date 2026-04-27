export type WalletStatus = 'Active' | 'Locked' | 'Replaced';
export type WalletRecoveryStatus = 'Pending' | 'Approved' | 'Rejected';

export interface WalletLinkRequest {
  walletAddress: string;
  signature?: string; // Optional for now if we mock the signing, but good to have
}

export interface WalletStatusResponse {
  walletAddress: string;
  status: WalletStatus;
  linkedAt: string;
}

export interface WalletRecoveryRequestDto {
  oldWalletAddress: string;
  newWalletAddress: string;
  signature?: string;
}

export interface WalletRecoveryResponse {
  requestId: number;
  status: WalletRecoveryStatus;
  createdAt: string;
}
