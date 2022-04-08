import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";
import { TestCase } from "./TestCase.entity";
import { TestState } from "./TestState.entity";

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

    /*@CreateDateColumn({
        name: "start_time",
        type: "datetime",
    })
    startTime: Date;

    @CreateDateColumn({
        name: "end_time",
        type: "datetime",
    })
    endTime: Date;*/

    @Column({
        type: 'int'
    })
    duration: number;
}