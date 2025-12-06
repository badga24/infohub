import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from "@nestjs/common";
import { CreateEventDto } from "dto/request/create-event.dto";
import { AuthGuard } from "guards/auth.guard";
import { EventsUseCase } from "use-case/events.use-case";

@Controller("event")
export class EventsController {
    constructor(private readonly eventsUseCase: EventsUseCase) {}

    @UseGuards(AuthGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    createEvent(@Body() dto: CreateEventDto) {
        return this.eventsUseCase.createEvent(dto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    getAllEvents(@Query('page') page: number, @Query('limit') limit: number) {
        return this.eventsUseCase.getAllEvents(page, limit);
    }

}