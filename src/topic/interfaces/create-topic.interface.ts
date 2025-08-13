import { Person } from "src/person/entities/person.entity";

export interface ICreateTopic {
    name: string;
    speakers: Person[];
}