export interface IpfsUploadInput {
  content: Buffer | string;
  fileName: string;
  mimeType?: string;
}

export interface IpfsUploadResult {
  cid: string;
  attempts: number;
}

export interface IpfsClient {
  upload(input: IpfsUploadInput): Promise<IpfsUploadResult>;
}

