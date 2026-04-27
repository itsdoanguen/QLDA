import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/global-http-exception.filter';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);

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
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/v1/docs', app, document);

	const port = Number(process.env.PORT ?? 3000);
	await app.listen(port);
}

void bootstrap();
