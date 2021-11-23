import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";
import { Project } from "./Project.entity";
import { TestState } from "./TestState.entity";

@Entity({
    name: 'test_suites'
})
export class TestSuite extends AuditEntity {
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

    @ManyToOne(type => TestState)
    @JoinColumn({
        name: 'test_state_id',
        referencedColumnName: 'id'
    })
    testState: TestState;

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