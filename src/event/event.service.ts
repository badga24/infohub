import { Injectable, Logger } from '@nestjs/common';
import { ICreateEvent } from './interfaces/create-event.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';
import { IUpdateEvent } from './interfaces/update-event.interface';
import { IPage } from 'interfaces/page.interface';
import { File } from 'file/entities/file.entity';

@Injectable()
export class EventService {

  private readonly logger: Logger = new Logger(EventService.name);

  constructor(
    @InjectRepository(Event) private readonly eventRepository: Repository<Event>
  ) { }

  create(createEvent: ICreateEvent) {
    return this.eventRepository.save(createEvent);
  }

  async findAll(page: number = 0, limit: number = 10, from?: Date, to?: Date): Promise<IPage<any>> {
    this.logger.log(`Fetching events - Page: ${page}, Limit: ${limit}, From: ${from}, To: ${to}`);
    const [results, total] = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.location', 'location')
      .leftJoinAndSelect('event.categories', 'categories')
      .leftJoinAndSelect('event.topics', 'topics')
      .leftJoinAndSelect('topics.speakers', 'speakers')
      .leftJoinAndSelect('event.cover', 'cover')
      .where(from ? "event.date >= :from" : "1=1", { from })
      .andWhere(to ? "event.date <= :to" : "1=1", { to })
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
    this.logger.log(`Fetching event with ID: ${id}`);
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
    this.logger.log(`Updating event with ID: ${id}`);
    return this.eventRepository.update(id, updateEvent);
  }

  remove(id: number) {
    this.logger.log(`Removing event with ID: ${id}`);
    return this.eventRepository.delete(id);
  }

  setCover(id: number, file: File) {
    this.logger.log(`Setting cover for event with ID: ${id}`);
    return this.eventRepository.update(id, { cover: file });
  }
}
