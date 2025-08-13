import { Category } from "src/category/entities/category.entity";
import { Person } from "src/person/entities/person.entity";

export interface ICreateArticle {
    title: string;
    content: Record<string, any>;
    categories: Category[];
    author: Person;
}