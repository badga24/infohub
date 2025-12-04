import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './event.service';
import { Event } from './entities/event.entity';
import { CategoryModule } from 'category/category.module';
import { LocationModule } from 'location/location.module';
import { TopicModule } from 'topic/topic.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    CategoryModule,
    LocationModule,
    TopicModule
  ],
  controllers: [],
  providers: [EventService],
})
export class EventModule {}
