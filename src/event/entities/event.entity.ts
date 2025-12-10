import { Category } from "category/entities/category.entity";
import { File } from "file/entities/file.entity";
import { Location } from "location/entities/location.entity";
import { Topic } from "topic/entities/topic.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
    @JoinTable()
    categories: Category[];

    @OneToOne(() => File, { nullable: true })
    @JoinColumn()
    cover: File;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    date: Date;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;

}
