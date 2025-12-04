import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ICreateEvent } from './interfaces/create-event.interface';
import { LocationService } from 'location/location.service';
import { TopicService } from 'topic/topic.service';
import { CategoryService } from 'category/category.service';
import { Category } from 'category/entities/category.entity';
import { AuthGuard } from 'guards/auth.guard';

@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly categoryService: CategoryService,
    private readonly topicService: TopicService,
    private readonly locationService: LocationService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createEventDto: CreateEventDto) {

    const categories: Category[] = await Promise.all(
      createEventDto.categories.map(async category => await this.categoryService.findOrCreate(category))
    );

    const topics = await Promise.all(
      createEventDto.topics.map(async topic => await this.topicService.create(topic))
    );

    const location = await this.locationService.findOne(createEventDto.location);

    const event: ICreateEvent = {
      name: createEventDto.name,
      location: location!,
      topics: topics,
      categories: categories
    }
    return this.eventService.create(event);
  }

  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(+id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove(+id);
  }
}
