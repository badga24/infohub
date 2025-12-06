import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class File {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'bigint' })
    contentLength: number;

    @Column({ type: 'varchar', length: 50 })
    contentType: string;

    @Column({ type: 'boolean', default: false })
    isUploaded: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    partialPath: string | null;

    getPath(): string {
        return this.partialPath ? this.partialPath + '/' + this.id : '';
    }
}
