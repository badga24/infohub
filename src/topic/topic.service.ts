import { Injectable } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { ICreateTopic } from './interfaces/create-topic.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { Repository } from 'typeorm';
import { IUpdateTopic } from './interfaces/update-topic.interface';

@Injectable()
export class TopicService {

  constructor(
    @InjectRepository(Topic) private readonly topicRepository: Repository<Topic>
  ) { }

  create(createTopic: ICreateTopic) {
    return this.topicRepository.save(createTopic);
  }

  findAll() {
    return this.topicRepository.find({
      relations: { speakers: true }
    });
  }

  findOne(id: number) {
    return this.topicRepository.findOne({
      where: { id },
      relations: { speakers: true }
    });
  }

  update(id: number, updateTopic: IUpdateTopic) {
    return this.topicRepository.update(id, updateTopic);
  }

  remove(id: number) {
    return this.topicRepository.delete(id);
  }
}
