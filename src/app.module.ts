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
import { AppConfigModule } from './config/app-config.module';
import { FileUseCase } from 'use-case/file.use-case';
import { FileController } from 'controllers/file.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DbModule,
    AppConfigModule,
    PersonModule,
    CategoryModule,
    ArticleModule,
    LocationModule,
    TopicModule,
    EventModule,
    FileModule,
    UserModule
  ],
  controllers: [
    UsersController,
    EventsController,
    FileController
  ],
  providers: [
    Mapper,
    UsersUseCase,
    EventsUseCase,
    FileUseCase
  ],
})
export class AppModule { }
