import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

}
