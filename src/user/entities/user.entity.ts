import { Person } from "person/entities/person.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "./role.entity";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50 })
    username: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @OneToOne(() => Person)
    @JoinColumn()
    person: Person;

    @ManyToOne(() => UserRole, role => role.users)
    @JoinColumn()
    role: UserRole;

}
