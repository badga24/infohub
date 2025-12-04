import { Injectable } from "@nestjs/common";
import { CreateEventDto } from "dto/request/create-event.dto";

@Injectable()
export class EventsUseCase {
    constructor() {}

    async create(dto: CreateEventDto) {

    }

}