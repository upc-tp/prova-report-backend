import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";
import { TestExecution } from "./TestExecution.entity";
import { TestState } from "./TestState.entity";

@Entity({
    name: 'test_execution_steps'
})
export class TestExecutionStep extends AuditEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @ManyToOne(type => TestExecution)
    @JoinColumn({
        name: 'test_execution_id',
        referencedColumnName: 'id'
    })
    testExecution: TestExecution;

    @ManyToOne(type => TestState)
    @JoinColumn({
        name: 'test_state_id',
        referencedColumnName: 'id'
    })
    testState: TestState;

    @Column({
        type: 'varchar',
        length: 128
    })
    name: string;

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
}