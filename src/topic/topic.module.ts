import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { PersonModule } from 'person/person.module';

@Module({
  imports: [TypeOrmModule.forFeature([Topic]), PersonModule],
  controllers: [],
  providers: [TopicService],
  exports: [TopicService],
})
export class TopicModule {}
