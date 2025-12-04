import { Body, Controller, Post } from "@nestjs/common";
import { CreateEventDto } from "dto/request/create-event.dto";
import { EventsUseCase } from "use-case/events.use-case";

@Controller("event")
export class EventsController {
    constructor(private readonly eventsUseCase: EventsUseCase) {}

    @Post()
    createEvent(@Body() dto: CreateEventDto) {
        
    }

}