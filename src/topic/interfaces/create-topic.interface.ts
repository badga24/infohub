import { Person } from "person/entities/person.entity";

export interface ICreateTopic {
    name: string;
    speakers: Person[];
}