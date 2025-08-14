import { Category } from "src/category/entities/category.entity";
import { Location } from "src/location/entities/location.entity";
import { Topic } from "src/topic/entities/topic.entity";

export interface ICreateEvent {
    name: string;
    location: Location;
    topics: Topic[];
    categories: Category[];
}