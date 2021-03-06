import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {AuditEntity} from "./AuditEntity.entity";
import {Project} from "./Project.entity";

@Entity({
    name: 'versions'
})
export class Version extends AuditEntity{
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @ManyToOne( type => Project)
    @JoinColumn({
        name: 'project_id',
        referencedColumnName: 'id'
    })
    project: Project;

    @Column({
        type: 'int'
    })
    order: number;

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
