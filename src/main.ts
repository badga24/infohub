import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { bootstrapSwagger } from 'config/swagger';

async function bootstrap() {
  const PORT = process.env.PORT ?? 3000;

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  bootstrapSwagger(app);

  await app.listen(PORT);

  console.log(`Application is running on: http://localhost:${PORT}`);
}
bootstrap();
