import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";
import { Sprint } from "./Sprint.entity.ts";

@Entity({
    name: 'user_stories'
})
export class UserStory extends AuditEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @ManyToOne(type => Sprint)
    @JoinColumn({
        name: 'sprint_id',
        referencedColumnName: 'id'
    })
    sprint: Sprint;

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