import { CategoryBasicDTO } from "../category/category-basic.dto";
import { FileBasicDTO } from "../file/file-basic.dto";
import { LocationBasicDTO } from "../location/location-basic.dto";
import { TopicBasicDTO } from "../topic/topic-basic.dto";

export interface EventBasicDTO {
    id: number;
    name: string;
    location: LocationBasicDTO;
    topics: TopicBasicDTO[];
    categories: CategoryBasicDTO[];
    cover?: FileBasicDTO;
}