import { isNotEmpty, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateTopicDto {

    @IsString()
    @MinLength(1)
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    speakers: number[];

}
