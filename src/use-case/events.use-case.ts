import { Injectable } from "@nestjs/common";
import { CategoryService } from "category/category.service";
import { Category } from "category/entities/category.entity";
import { CreateEventDto, UpdateEventDto } from "dto/request";
import { EventService } from "event/event.service";
import { CreateFileDto } from "file/dto/create-file.dto";
import { File } from "file/entities/file.entity";
import { FileService } from "file/file.service";
import { LocationService } from "location/location.service";
import { Mapper } from "mapper";
import { Person } from "person/entities/person.entity";
import { PersonService } from "person/person.service";
import { Topic } from "topic/entities/topic.entity";
import { TopicService } from "topic/topic.service";
import { Transactional } from "typeorm-transactional";

@Injectable()
export class EventsUseCase {
    constructor(
        private readonly eventService: EventService,
        private readonly locationService: LocationService,
        private readonly topicService: TopicService,
        private readonly personService: PersonService,
        private readonly categoryService: CategoryService,
        private readonly fileService: FileService,
        private readonly mapper: Mapper
    ) { }

    @Transactional()
    async createEvent(dto: CreateEventDto) {
        const location = await this.locationService.create(dto.location);

        const topics: Topic[] = [];
        for (let i = 0; i < dto.topics.length; i++) {
            const topic = dto.topics[i];
            const speakers: Person[] = [];
            for (let j = 0; j < topic.speakers.length; j++) {
                const speaker = topic.speakers[j];
                const person = await this.personService.create(speaker);
                speakers.push(person);
            }
            const createdTopic = await this.topicService.create({
                name: topic.name,
                speakers: speakers,
            });
            topics.push(createdTopic);
        }

        const categories: Category[] = [];
        for (let i = 0; i < dto.categories.length; i++) {
            const categoryDto = dto.categories[i];
            const category = await this.categoryService.create(categoryDto);
            categories.push(category);
        }

        const event = await this.eventService.create({
            name: dto.name,
            date: dto.date,
            location: location,
            topics: topics,
            categories: categories,
        })

        let cover: File | undefined = undefined;
        if(dto.cover) {
            cover = await this.fileService.create(event!.id!.toString(), dto.cover);
            event.cover = cover;
        }

        return this.mapper.toEventBasicDTO(event);
    }

    async updateEvent(id: number, dto: UpdateEventDto) {
        await this.eventService.update(id, dto);
    }

    @Transactional()
    async deleteEvent(id: number) {
        const event = await this.eventService.findOne(id);
        if (event?.cover != null) {
            await this.fileService.remove(event.cover);
        }
        await this.eventService.remove(id);
    }

    @Transactional()
    async addCover(id: number, createFileDto: CreateFileDto) {
        const event = await this.eventService.findOne(id);
        if (event?.cover != null) {
            await this.fileService.remove(event.cover);
        }
        const file = await this.fileService.create(event!.id!.toString(), createFileDto);
        await this.eventService.setCover(id, file);
    }

    findOne(id: number) {
        return this.eventService.findOne(id);
    }

    @Transactional()
    async getAllEvents(page?: number, limit?: number, from?: Date, to?: Date) {
        const results = await this.eventService.findAll(page, limit, from, to);
        const contentMapped = results.content.map(event => this.mapper.toEventBasicDTO(event));
        results.content = contentMapped;
        return results;
    }

}