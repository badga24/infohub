import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { bootstrapSwagger } from 'config/swagger';
import { addTransactionalDataSource, initializeTransactionalContext } from 'typeorm-transactional';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const PORT = process.env.PORT ?? 3000;
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({})
  });
  addTransactionalDataSource(app.get(DataSource));
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  })
  
  bootstrapSwagger(app);
  
  await app.listen(PORT);

  console.log(`Application is running on: http://localhost:${PORT}`);
}
bootstrap();
