import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { CreateLocationDto } from "./create-location.dto";
import { CreateTopicDto } from "./create-topic.dto";
import { CreateCategoryDto } from "./create-catogory.dto";
import { CreateFileDto } from "file/dto/create-file.dto";

export class CreateEventDto {


    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    name: string;

    @IsNotEmpty()
    location: CreateLocationDto;

    topics: CreateTopicDto[];

    categories: CreateCategoryDto[];

    cover?: CreateFileDto;

}
