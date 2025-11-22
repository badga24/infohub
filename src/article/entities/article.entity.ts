import { Category } from "category/entities/category.entity";
import { Person } from "person/entities/person.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Article {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    title: string;

    @Column({ type: "jsonb" })
    content: Record<string, any>;

    @ManyToMany(() => Category, category => category.articles)
    @JoinTable()
    categories: Category[];

    @ManyToOne(() => Person, person => person.articles)
    author: Person;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;

}
