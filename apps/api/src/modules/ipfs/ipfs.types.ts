export interface IpfsUploadInput {
  content: Buffer | string;
  fileName: string;
  mimeType?: string;
}

export interface IpfsUploadResult {
  cid: string;
  attempts: number;
}

export interface IpfsJsonUploadInput {
  json: Record<string, unknown>;
  name: string;
}

/**
 * NFT metadata following ERC-721 Metadata Standard.
 * Used to build the JSON that gets pinned to IPFS before minting.
 */
export interface NftMetadata {
  name: string;
  description: string;
  image?: string; // ipfs://<CID> of the scanned land document
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface IpfsClient {
  upload(input: IpfsUploadInput): Promise<IpfsUploadResult>;
  uploadJson(input: IpfsJsonUploadInput): Promise<IpfsUploadResult>;
}
