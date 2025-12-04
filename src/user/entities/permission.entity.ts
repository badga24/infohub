import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "./role.entity";

@Entity()
export class Permission {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50 })
    name: string;

    @ManyToMany(() => UserRole, role => role.permissions)
    roles: UserRole[];

}