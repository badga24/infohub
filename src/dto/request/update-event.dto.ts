import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class UpdateEventDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    name: string;

    @IsNotEmpty()
    date: Date;
}