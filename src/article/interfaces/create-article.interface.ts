import { Category } from "category/entities/category.entity";
import { Person } from "person/entities/person.entity";

export interface ICreateArticle {
    title: string;
    content: Record<string, any>;
    categories: Category[];
    author: Person;
}