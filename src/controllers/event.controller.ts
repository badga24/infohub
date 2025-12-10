import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CreateEventDto, UpdateEventDto } from "dto/request";
import { CreateFileDto } from "file/dto/create-file.dto";
import { AuthGuard } from "guards/auth.guard";
import { EventsUseCase } from "use-case/events.use-case";

@Controller("event")
export class EventsController {
    constructor(private readonly eventsUseCase: EventsUseCase) { }
    
    @Get()
    @HttpCode(HttpStatus.OK)
    getAllEvents(@Query('page') page: number, @Query('limit') limit: number, @Query('from') from?: Date, @Query('to') to?: Date) {
        return this.eventsUseCase.getAllEvents(page, limit, from, to);
    }

    @Get(":id")
    @HttpCode(HttpStatus.OK)
    getEventById(@Param('id') id: number) {
        return this.eventsUseCase.findOne(id);
    }

    @UseGuards(AuthGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    createEvent(@Body() dto: CreateEventDto) {
        return this.eventsUseCase.createEvent(dto);
    }

    @UseGuards(AuthGuard)
    @Put(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    updateEvent(@Param('id') id: number, @Body() dto: UpdateEventDto) {
        return this.eventsUseCase.updateEvent(id, dto);
    }

    @UseGuards(AuthGuard)
    @Put(":id/cover")
    @HttpCode(HttpStatus.NO_CONTENT)
    setCover(@Param('id') id: number, @Body() dto: CreateFileDto) {
        return this.eventsUseCase.addCover(id, dto);
    }

    @UseGuards(AuthGuard)
    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteEvent(@Param('id') id: number) {
        return this.eventsUseCase.deleteEvent(id);
    }


}