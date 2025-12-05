import { Article } from "article/entities/article.entity";
import { Topic } from "topic/entities/topic.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Person {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100})
    firstName: string;

    @Column({ type: 'varchar', length: 50})
    lastName: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    email: string;

    @ManyToMany(() => Topic, topic => topic.speakers)
    topics: Topic[];

    @OneToMany(() => Article, article => article.author)
    articles: Article[];

}
