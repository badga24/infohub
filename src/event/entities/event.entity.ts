import { Category } from "src/category/entities/category.entity";
import { Location } from "src/location/entities/location.entity";
import { Topic } from "src/topic/entities/topic.entity";
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
