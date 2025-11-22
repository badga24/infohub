import { Event } from "event/entities/event.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Location {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    address: string;

    @Column({ type: 'decimal', precision: 10, scale: 8 })
    lat?: number;

    @Column({ type: 'decimal', precision: 10, scale: 8 })
    lng?: number;

    @OneToMany(() => Event, event => event.location)
    events: Event[];

}
