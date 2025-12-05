import { Injectable } from "@nestjs/common";
import { EventBasicDTO } from "dto/responses/event/even-basic.dto";
import { UserBasicDto } from "dto/responses/user/user-basic.dto";
import { Event } from "event/entities/event.entity";
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
            name: event.name
        };
    }

}