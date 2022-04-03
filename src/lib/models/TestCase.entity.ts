import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";
import { Priority } from "./Priority.entity";
import { Severity } from "./Severity.entity";
import { TestExecution } from "./TestExecution.entity";
import { TestState } from "./TestState.entity";
import { TestSuite } from "./TestSuite.entity";
import {User} from "./User.entity";

@Entity({
    name: 'test_cases'
})
export class TestCase extends AuditEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @ManyToOne(type => TestSuite)
    @JoinColumn({
        name: 'test_suite_id',
        referencedColumnName: 'id'
    })
    testSuite: TestSuite;

    @ManyToOne(type => TestState)
    @JoinColumn({
        name: 'test_state_id',
        referencedColumnName: 'id'
    })
    testState: TestState;

    @OneToMany(() => TestExecution, te => te.testCase)
    testExecutions: TestExecution[];

    @ManyToOne(type => Priority)
    @JoinColumn({
        name: 'priority_id',
        referencedColumnName: 'id'
    })
    priority: Priority;

    @ManyToOne(type => Severity)
    @JoinColumn({
        name: 'severity_id',
        referencedColumnName: 'id'
    })
    severity: Severity;

    @ManyToOne(type => User)
    @JoinColumn({
        name: 'user_charge_id',
        referencedColumnName: 'id'
    })
    userInCharge: User;

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
