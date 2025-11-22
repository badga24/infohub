import { Category } from "category/entities/category.entity";
import { Location } from "location/entities/location.entity";
import { Topic } from "topic/entities/topic.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Event {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @ManyToOne(() => Location, location => location.events)
    location: Location;

    @OneToMany(() => Topic, topic => topic.event)
    topics: Topic[];

    @ManyToMany(() => Category, category => category.events)
    categories: Category[];

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;

}
