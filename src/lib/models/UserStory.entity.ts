import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";

@Entity({
    name: 'user_stories'
})
export class UserStory extends AuditEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @Column({
        type: 'varchar',
        length: 64
    })
    title: string;

    @Column({
        type: 'varchar',
        length: 128
    })
    description: string;
}