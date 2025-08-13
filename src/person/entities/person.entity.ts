import { Article } from "src/article/entities/article.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Person {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100})
    firstName: string;

    @Column({ type: 'varchar', length: 50})
    lastName: string;

    @Column({ type: 'varchar', length: 100 })
    email: string;

    @OneToMany(() => Article, article => article.author)
    articles: Article[];

}
