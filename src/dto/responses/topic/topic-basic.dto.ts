import { PersonBasicDTO } from "../person/person-basic.dto";

export interface TopicBasicDTO {
    id: number;
    name: string;
    speakers: PersonBasicDTO[];
}