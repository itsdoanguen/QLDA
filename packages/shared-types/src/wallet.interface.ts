export type WalletStatus = 'Active' | 'Locked' | 'Replaced';
export type WalletRecoveryStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LinkWalletRequest {
  walletAddress: string;
}

export interface WalletStatusResponse {
  walletAddress: string;
  status: WalletStatus;
  linkedAt: string;
}

export interface RecoveryRequestPayload {
  oldWalletAddress: string;
  newWalletAddress: string;
}

export interface RecoveryRequestResponse {
  requestId: number;
  status: WalletRecoveryStatus;
  createdAt: string;
}
