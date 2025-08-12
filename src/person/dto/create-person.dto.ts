import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreatePersonDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    lastName: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;
    
}
