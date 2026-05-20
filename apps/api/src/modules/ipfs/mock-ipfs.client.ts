import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

import { IpfsClient, IpfsUploadInput, IpfsUploadResult, IpfsJsonUploadInput } from './ipfs.types';

@Injectable()
export class MockIpfsClient implements IpfsClient {
  async upload(input: IpfsUploadInput): Promise<IpfsUploadResult> {
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < 3) {
      attempts += 1;
      try {
        const contentStr = Buffer.isBuffer(input.content)
          ? input.content.toString('utf8')
          : input.content;

        if (contentStr.includes('simulate-ipfs-failure')) {
          throw new Error('Simulated IPFS upload failure.');
        }

        const digest = createHash('sha256').update(input.content).digest('hex').slice(0, 44);
        return {
          cid: `Qm${digest}`,
          attempts,
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown IPFS error.');
      }
    }

    throw new Error(`IPFS upload failed after 3 attempts: ${lastError?.message ?? 'Unknown error'}`);
  }

  async uploadJson(input: IpfsJsonUploadInput): Promise<IpfsUploadResult> {
    const jsonStr = JSON.stringify(input.json);

    if (jsonStr.includes('simulate-ipfs-failure')) {
      throw new Error('Simulated IPFS JSON upload failure.');
    }

    const digest = createHash('sha256').update(jsonStr).digest('hex').slice(0, 44);
    return {
      cid: `Qm${digest}`,
      attempts: 1,
    };
  }
}
