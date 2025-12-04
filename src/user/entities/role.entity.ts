import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./permission.entity";
import { User } from "./user.entity";

@Entity()
export class UserRole {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50 })
    name: string;

    @ManyToMany(() => Permission, permission => permission.roles)
    @JoinTable()
    permissions: Permission[];

    @OneToMany(() => User, user => user.role)
    users: User[];
}