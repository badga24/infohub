import { Injectable } from '@nestjs/common';
import { ICreateEvent } from './interfaces/create-event.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';
import { IUpdateEvent } from './interfaces/update-event.interface';

@Injectable()
export class EventService {

  constructor(
    @InjectRepository(Event) private readonly eventRepository: Repository<Event>
  ) { }

  create(createEvent: ICreateEvent) {
    return this.eventRepository.save(createEvent);
  }

  findAll() {
    return this.eventRepository.find({
      relations: {
        location: true,
        categories: true,
      },
    });
  }

  findOne(id: number) {
    return this.eventRepository.findOne({
      where: { id },
      relations: {
        location: true,
        categories: true,
        topics: true,
      },
    });
  }

  update(id: number, updateEvent: IUpdateEvent) {
    return this.eventRepository.update(id, updateEvent);
  }

  remove(id: number) {
    return this.eventRepository.delete(id);
  }
}
