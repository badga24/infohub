import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { PersonService } from 'person/person.service';
import { ICreateTopic } from './interfaces/create-topic.interface';

@Controller('topic')
export class TopicController {
  constructor(
    private readonly topicService: TopicService,
    private readonly personService: PersonService
  ) { }

  @Post()
  async create(@Body() createTopicDto: CreateTopicDto) {

    const speakers = await Promise.all(
      createTopicDto.speakers.map(async speaker => {
        return (await this.personService.findOne(speaker))!;
      })
    );

    const topic: ICreateTopic = {
      name: createTopicDto.name,
      speakers: speakers
    }

    return this.topicService.create(topic);
  }

  @Get()
  findAll() {
    return this.topicService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topicService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto) {
    return this.topicService.update(+id, updateTopicDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.topicService.remove(+id);
  }
}
