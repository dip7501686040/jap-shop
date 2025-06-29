import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 4000;
  const frontendUrl = configService.get<string>('FRONTEND_URL');

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable CORS with frontend URL
  app.enableCors({
    origin: frontendUrl || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('API Gateway Service')
    .setDescription('API documentation for the API Gateway Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  console.log(
    `API Gateway Service is running on port ${port} with env ${configService.get<string>(
      'ENV',
    )}`,
  );
  console.log(`Frontend URL: ${frontendUrl || 'http://localhost:3000'}`);
  console.log(
    `Swagger documentation available at: http://localhost:${port}/api/docs`,
  );
  await app.listen(port);
}
bootstrap();
