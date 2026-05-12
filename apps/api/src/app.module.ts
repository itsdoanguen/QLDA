import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { getEnvFilePaths } from './config/env/env-paths';
import { validateEnv } from './config/env/env.schema';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { IpfsModule } from './modules/ipfs/ipfs.module';
import { RedisModule } from './modules/redis/redis.module';
import { VneidModule } from './modules/vneid/vneid.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { FilesModule } from './modules/files/files.module';
import { StaffModule } from './modules/staff/staff.module';
import { LandRecordModule } from './modules/land-records/land-record.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { NftModule } from './modules/nft/nft.module';


@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: getEnvFilePaths(),
			validate: validateEnv,
			cache: true,
		}),
		DatabaseModule,
		AuthModule,
		WalletModule,
		RedisModule,
		IpfsModule,
		VneidModule,
		HealthModule,
		BlockchainModule,
		FilesModule,
		StaffModule,
		LandRecordModule,
		ApprovalsModule,
		NftModule,
	],

})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(RequestIdMiddleware).forRoutes('*');
	}
}
