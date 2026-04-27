import { Module } from '@nestjs/common';

import { IPFS_CLIENT } from './ipfs.constants';
import { MockIpfsClient } from './mock-ipfs.client';

@Module({
  providers: [
    {
      provide: IPFS_CLIENT,
      useClass: MockIpfsClient,
    },
    MockIpfsClient,
  ],
  exports: [IPFS_CLIENT, MockIpfsClient],
})
export class IpfsModule {}
