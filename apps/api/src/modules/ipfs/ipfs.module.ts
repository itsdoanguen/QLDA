import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { IPFS_CLIENT } from './ipfs.constants';
import { MockIpfsClient } from './mock-ipfs.client';
import { PinataIpfsClient } from './pinata-ipfs.client';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: IPFS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const jwt = configService.get<string>('PINATA_JWT');
        if (jwt && jwt !== 'change_me' && jwt !== '') {
          return new PinataIpfsClient(configService);
        }
        return new MockIpfsClient();
      },
      inject: [ConfigService],
    },
    MockIpfsClient,
    PinataIpfsClient,
  ],
  exports: [IPFS_CLIENT, MockIpfsClient, PinataIpfsClient],
})
export class IpfsModule {}

