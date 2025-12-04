import { CreatePersonDto } from "./create-person.dto";

export class CreateTopicDto {
    name: string;
    speakers: CreatePersonDto[];
}