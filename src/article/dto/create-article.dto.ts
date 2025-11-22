import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { CreateCategoryDto } from "category/dto/create-category.dto";

export class CreateArticleDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    title: string;

    @IsNotEmpty()
    content: Record<string, any>;
    
    categories: CreateCategoryDto[];

    @IsNotEmpty()
    author: number;
}
