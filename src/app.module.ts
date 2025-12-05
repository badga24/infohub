import { Module } from '@nestjs/common';
import { PersonModule } from './person/person.module';
import { CategoryModule } from './category/category.module';
import { ArticleModule } from './article/article.module';
import { LocationModule } from './location/location.module';
import { TopicModule } from './topic/topic.module';
import { EventModule } from './event/event.module';
import { UserModule } from './user/user.module';
import { FileModule } from './file/file.module';
import { DbModule } from './db/db.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from 'controllers/users.controller';
import { EventsController } from 'controllers/event.controller';
import { UsersUseCase } from 'use-case/users.use-case';
import { Mapper } from 'mapper';
import { EventsUseCase } from 'use-case/events.use-case';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
    PersonModule,
    CategoryModule,
    ArticleModule,
    LocationModule,
    TopicModule,
    EventModule,
    FileModule,
    UserModule,
    DbModule
  ],
  controllers: [
    UsersController,
    EventsController
  ],
  providers: [
    Mapper,
    UsersUseCase,
    EventsUseCase
  ],
})
export class AppModule { }
