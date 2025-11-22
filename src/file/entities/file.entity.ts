import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class File {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'number'})
    contentLength: number;

    @Column({ type: 'varchar', length: 50 })
    contentType: string;

    @Column({ type: 'boolean', default: false })
    isUploaded: boolean;
}
