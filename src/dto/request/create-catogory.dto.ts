import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateCategoryDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    name: string;

}
