import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

}
