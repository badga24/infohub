import { Article } from "src/article/entities/article.entity";
import { Event } from "src/event/entities/event.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Category {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @ManyToMany(() => Article, article => article.categories)
    articles: Article[];

    @ManyToMany(() => Event, event => event.categories)
    events: Event[];

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;

}
