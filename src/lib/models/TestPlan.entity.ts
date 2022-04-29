import { type } from "os";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";
import { Project } from "./Project.entity";
import { Version } from "./Version.entity";

@Entity({
    name: 'test_plans'
})
export class TestPlan extends AuditEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @ManyToOne(type => Project)
    @JoinColumn({
        name: 'project_id',
        referencedColumnName: 'id'
    })
    project: Project;

    @ManyToOne(type => Version)
    @JoinColumn({
        name: 'version_id',
        referencedColumnName: 'id'
    })
    version: Version;

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