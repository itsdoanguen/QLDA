export interface IpfsUploadInput {
  content: string;
  filename?: string;
}

export interface IpfsUploadResult {
  cid: string;
  attempts: number;
}

export interface IpfsClient {
  upload(input: IpfsUploadInput): Promise<IpfsUploadResult>;
}
