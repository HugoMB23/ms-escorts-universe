import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // CORS (ajusta origins si quieres restringir)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: '*',
  });

  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

  // Railway te inyecta PORT; default 3000 local
  const port = Number(process.env.PORT ?? 3000);

  // Importante: bind en 0.0.0.0 para recibir tráfico externo en Railway
  await app.listen(port, '0.0.0.0');
  console.log(`✅ Nest escuchando en http://0.0.0.0:${port}`);
}

bootstrap();
