import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.use(helmet({ crossOriginResourcePolicy: false }));
  const origins = (process.env.CORS_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean);
  if (origins.length) app.enableCors({ origin: origins });
  await app.listen(Number(process.env.PORT || 4000));
}
bootstrap();
