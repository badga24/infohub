import { Injectable } from "@nestjs/common";
import { Category } from "category/entities/category.entity";
import { CategoryBasicDTO } from "dto/responses/category/category-basic.dto";
import { EventBasicDTO } from "dto/responses/event/event-basic.dto";
import { FileBasicDTO } from "dto/responses/file/file-basic.dto";
import { LocationBasicDTO } from "dto/responses/location/location-basic.dto";
import { PersonBasicDTO } from "dto/responses/person/person-basic.dto";
import { TopicBasicDTO } from "dto/responses/topic/topic-basic.dto";
import { UserBasicDto } from "dto/responses/user/user-basic.dto";
import { Event } from "event/entities/event.entity";
import { File } from "file/entities/file.entity";
import { Location } from "location/entities/location.entity";
import { Person } from "person/entities/person.entity";
import { Topic } from "topic/entities/topic.entity";
import { User } from "user/entities/user.entity";

@Injectable()
export class Mapper {

    toUserBasicDTO(user: User): UserBasicDto {
        return {
            id: user.id,
            username: user.username
        }
    }

    toEventBasicDTO(event: Event): EventBasicDTO {
        return {
            id: event.id,
            name: event.name,
            location: this.toLocationBasicDTO(event.location),
            categories: event.categories.map(category => this.toCategoryBasicDTO(category)),
            topics: event.topics.map(topic => this.toTopicBasicDTO(topic)),
            cover: event.cover ? this.toFileBasicDTO(event.cover) : undefined
        };
    }

    toCategoryBasicDTO(category: Category): CategoryBasicDTO {
        return {
            id: category.id,
            name: category.name
        };
    }

    toLocationBasicDTO(location: Location): LocationBasicDTO {
        return {
            id: location.id,
            address: location.address,
            lat: location.lat,
            lng: location.lng
        };
    }

    toTopicBasicDTO(topic: Topic): TopicBasicDTO {
        return {
            id: topic.id,
            name: topic.name,
            speakers: topic.speakers.map(speaker => this.toPersonBasicDTO(speaker))
        }
    }

    toPersonBasicDTO(person: Person): PersonBasicDTO {
        return {
            id: person.id,
            firstName: person.firstName,
            lastName: person.lastName
        };
    }

    toFileBasicDTO(file: File): FileBasicDTO {
        return {
            id: file.id,
            name: file.name,
            contentType: file.contentType,
            contentLength: file.contentLength
        };
    }

}