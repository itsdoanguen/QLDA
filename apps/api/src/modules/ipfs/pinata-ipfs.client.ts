import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as FormData from 'form-data';

import { IpfsClient, IpfsUploadInput, IpfsUploadResult } from './ipfs.types';

@Injectable()
export class PinataIpfsClient implements IpfsClient {
  private readonly logger = new Logger(PinataIpfsClient.name);
  private readonly axiosInstance: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const jwt = this.configService.get<string>('PINATA_JWT');
    const baseURL = this.configService.get<string>('PINATA_API_BASE');

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
  }

  async upload(input: IpfsUploadInput): Promise<IpfsUploadResult> {
    const form = new FormData();
    
    // Convert Buffer or String to stream-like for FormData if needed, 
    // but axios handles Buffer fine in FormData
    form.append('file', input.content, {
      filename: input.fileName,
      contentType: input.mimeType,
    });

    // Optional: Add Pinata metadata
    const metadata = JSON.stringify({
      name: input.fileName,
    });
    form.append('pinataMetadata', metadata);

    let attempts = 0;
    let lastError: any = null;

    while (attempts < 3) {
      attempts += 1;
      try {
        const response = await this.axiosInstance.post('/pinning/pinFileToIPFS', form, {
          headers: {
            ...form.getHeaders(),
          },
          maxBodyLength: Infinity,
        });

        return {
          cid: response.data.IpfsHash,
          attempts,
        };
      } catch (error: any) {
        lastError = error;
        const status = error.response?.status;
        
        // Retry only for 429 (Too Many Requests), 5xx (Server Error), or network issues
        const isRetryable = status === 429 || (status >= 500 && status <= 599) || !status;
        
        if (!isRetryable || attempts >= 3) {
          this.logger.error(
            `IPFS upload failed: ${error.message}`,
            error.response?.data,
          );
          break;
        }


        this.logger.warn(`IPFS upload attempt ${attempts} failed, retrying...`);
        // Exponential backoff or simple delay
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }

    throw new Error(
      `IPFS upload failed after ${attempts} attempts: ${
        lastError?.response?.data?.error || lastError?.message
      }`,
    );
  }
}
