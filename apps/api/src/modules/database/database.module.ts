import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { validateEnv } from '../../config/env/env.schema';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			useFactory: () => {
				const env = validateEnv(process.env);

				return {
					type: 'postgres' as const,
					host: env.DB_HOST,
					port: env.DB_PORT,
					username: env.DB_USERNAME,
					password: env.DB_PASSWORD,
					database: env.DB_NAME,
					autoLoadEntities: true,
					synchronize: false,
				};
			},
		}),
	],
})
export class DatabaseModule {}
