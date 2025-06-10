import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 4000;

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
    `API Gateway Service is running on port ${port} with env new update 102 ${configService.get<string>('ENV')} test change`,
  );
  await app.listen(port);
}
bootstrap();
