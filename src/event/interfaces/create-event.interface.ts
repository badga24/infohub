import { Category } from "category/entities/category.entity";
import { File } from "file/entities/file.entity";
import { Location } from "location/entities/location.entity";
import { Topic } from "topic/entities/topic.entity";

export interface ICreateEvent {
    name: string;
    date: Date;
    location: Location;
    topics: Topic[];
    categories: Category[];
    cover?: File;
}