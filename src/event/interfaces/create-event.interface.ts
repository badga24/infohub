import { Category } from "category/entities/category.entity";
import { Location } from "location/entities/location.entity";
import { Topic } from "topic/entities/topic.entity";

export interface ICreateEvent {
    name: string;
    location: Location;
    topics: Topic[];
    categories: Category[];
}