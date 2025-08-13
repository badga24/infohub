import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateArticleDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    title: string;

    @IsNotEmpty()
    content: Record<string, any>;
}
