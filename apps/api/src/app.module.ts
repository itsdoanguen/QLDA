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
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(RequestIdMiddleware).forRoutes('*');
	}
}
