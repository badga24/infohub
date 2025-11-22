import { IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

export class CreateFileDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    name: string;

    @IsNumber()
    contentLength: number;

    @IsString()
    @IsNotEmpty()
    contentType: string;

}
