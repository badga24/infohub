import { Event } from "event/entities/event.entity";
import { Person } from "person/entities/person.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Topic {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @ManyToMany(() => Person, person => person.topics)
    @JoinTable()
    speakers: Person[];

    @ManyToOne(() => Event, event => event.topics)
    event: Event;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;

}
