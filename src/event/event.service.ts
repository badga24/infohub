import { Injectable } from '@nestjs/common';
import { ICreateEvent } from './interfaces/create-event.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';
import { IUpdateEvent } from './interfaces/update-event.interface';
import { IPage } from 'interfaces/page.interface';

@Injectable()
export class EventService {

  constructor(
    @InjectRepository(Event) private readonly eventRepository: Repository<Event>
  ) { }

  create(createEvent: ICreateEvent) {
    return this.eventRepository.save(createEvent);
  }

  async findAll(page: number = 0, limit: number = 10): Promise<IPage<any>> {

    const [results, total] = await this.eventRepository
      .createQueryBuilder('event')
      .skip(page * limit)
      .take(limit)
      .getManyAndCount();

    return {
      content: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1
    };
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
