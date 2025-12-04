import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}
