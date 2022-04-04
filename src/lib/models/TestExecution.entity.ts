import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";
import { TestState } from "./TestState.entity";
import { TestCase } from "./TestCase.entity";
import { TestExecutionStep } from "./TestExecutionStep.entity";

@Entity({
    name: 'test_executions'
})
export class TestExecution extends AuditEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @Column({
        type: 'int'
    })
    order: number;

    @ManyToOne(type => TestState)
    @JoinColumn({
        name: 'test_state_id',
        referencedColumnName: 'id'
    })
    testState: TestState;

    @ManyToOne(type => TestCase)
    @JoinColumn({
        name: 'test_case_id',
        referencedColumnName: 'id'
    })
    testCase: TestCase;

    @Column({
        type: 'datetime',
        name: 'start_time'
    })
    startTime: Date;

    @Column({
        type: 'datetime',
        name: 'end_time'
    })
    endTime: Date;

    @Column({
        type: 'int',
        name: 'duration'
    })
    duration: number;

    @Column({
        type: 'text',
        name: 'comments'
    })
    comments: string;

    @OneToMany(() => TestExecutionStep, s => s.testExecution, {
        cascade: true
    })
    testExecutionSteps: TestExecutionStep[];
}