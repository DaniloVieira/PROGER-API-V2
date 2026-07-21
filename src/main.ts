import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api/v2');

  const config = new DocumentBuilder()
    .setTitle('PROGER API v2.0')
    .setDescription('Programação de Geração — Modular Monolith')
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 PROGER API v2.0 running on http://localhost:${port}/api/v2`);
  console.log(`📚 Swagger docs at http://localhost:${port}/docs`);
}
bootstrap();
