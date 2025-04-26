import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 4000;
  console.log(
    `API Gateway Service is running on port ${port} with env 117 ${configService.get<string>('ENV')} test change`,
  );
  await app.listen(port);
}
bootstrap();
