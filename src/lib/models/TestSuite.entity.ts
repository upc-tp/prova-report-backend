import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";
import { Project } from "./Project.entity";
import { TestCase } from "./TestCase.entity";
import { TestPlan } from "./TestPlan.entity";
import { TestState } from "./TestState.entity";

@Entity({
    name: 'test_suites'
})
export class TestSuite extends AuditEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @Column({
        type: 'varchar',
        length: 16
    })
    tag: string;

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

    @ManyToOne(type => Project)
    @JoinColumn({
        name: 'project_id',
        referencedColumnName: 'id'
    })
    project: Project;

    @ManyToOne(type => TestPlan)
    @JoinColumn({
        name: 'test_plan_id',
        referencedColumnName: 'id'
    })
    testPlan: TestPlan;

    @ManyToOne(type => TestState)
    @JoinColumn({
        name: 'test_state_id',
        referencedColumnName: 'id'
    })
    testState: TestState;

    @OneToMany(() => TestCase, tc => tc.testSuite)
    testCases: TestCase[];
}