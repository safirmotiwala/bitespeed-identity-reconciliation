import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('Bitespeed API')
    .setDescription('API documentation for Bitespeed')
    .setVersion('1.0')
    .addTag('bitespeed')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT || 3000).then(() => {
    console.log(`⚡ Server listening on port ${process.env.PORT || 3000}`);
  });
}
bootstrap();
