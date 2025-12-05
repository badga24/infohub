import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CreateEventDto } from "dto/request/create-event.dto";
import { EventsUseCase } from "use-case/events.use-case";

@Controller("event")
export class EventsController {
    constructor(private readonly eventsUseCase: EventsUseCase) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    createEvent(@Body() dto: CreateEventDto) {
        return this.eventsUseCase.createEvent(dto);
    }

}