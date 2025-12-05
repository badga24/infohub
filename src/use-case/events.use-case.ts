import { Injectable } from "@nestjs/common";
import { CategoryService } from "category/category.service";
import { Category } from "category/entities/category.entity";
import { CreateEventDto } from "dto/request/create-event.dto";
import { EventService } from "event/event.service";
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
            location: location,
            topics: topics,
            categories: categories,
        })

        return this.mapper.toEventBasicDTO(event);
    }

}