import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Event } from './entities/event.entity';
import { CategoryModule } from 'src/category/category.module';
import { LocationModule } from 'src/location/location.module';
import { TopicModule } from 'src/topic/topic.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    CategoryModule,
    LocationModule,
    TopicModule
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
