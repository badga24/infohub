import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { CreateCategoryDto } from "src/category/dto/create-category.dto";
import { ICreateTopic } from "src/topic/interfaces/create-topic.interface";

export class CreateEventDto {


    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    name: string;

    @IsNotEmpty()
    location: number;

    topics: ICreateTopic[];

    categories: CreateCategoryDto[];

}
