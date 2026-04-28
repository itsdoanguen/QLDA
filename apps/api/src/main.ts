import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env files relative to apps/api so turbo/monorepo run location does not change PORT unexpectedly.
const envFiles = [
	path.resolve(__dirname, '../.env.development.local'),
	path.resolve(__dirname, '../.env.local'),
	path.resolve(__dirname, '../.env'),
];

for (const envFile of envFiles) {
	dotenv.config({ path: envFile, override: true });
}

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/global-http-exception.filter';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);
	app.enableCors();

	app.setGlobalPrefix('api/v1');
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);
	app.useGlobalFilters(new GlobalHttpExceptionFilter());

	const config = new DocumentBuilder()
		.setTitle('Land Registry API')
		.setDescription('The Land Registry System API documentation')
		.setVersion('1.0')
		.addBearerAuth(undefined, 'access-token')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/v1/docs', app, document);

	const port = Number(process.env.PORT ?? 3000);
	await app.listen(port);
}

void bootstrap();
