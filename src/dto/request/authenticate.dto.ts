import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class AuthenticateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
