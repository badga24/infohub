import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateLocationDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    address: string;

    @IsNotEmpty()
    lat?: number;

    @IsNotEmpty()
    lng?: number;

}
