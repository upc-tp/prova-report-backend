import internal from "stream";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";
import { DefectState } from "./DefectState.entity";
import { Priority } from "./Priority.entity";
import { Severity } from "./Severity.entity";
import { TestCase } from "./TestCase.entity";
import { TestExecution } from "./TestExecution.entity";

@Entity({
    name: 'defects'
})
export class Defect extends AuditEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @ManyToOne(type => DefectState)
    @JoinColumn({
        name: 'defect_state_id',
        referencedColumnName: 'id'
    })
    defectState: DefectState;

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

    @ManyToOne(type => TestCase)
    @JoinColumn({
        name: 'test_case_id',
        referencedColumnName: 'id'
    })
    testCase: TestCase;

    @ManyToOne(type => TestExecution)
    @JoinColumn({
        name: 'test_execution_id',
        referencedColumnName: 'id'
    })
    testExecution: TestExecution;

    @Column({
        type: 'varchar',
        length: 64
    })
    title: string;

    @Column({
        type: 'text',
    })
    repro_steps: string;

    @Column({
        type: 'tinyint',
    })
    is_fixed: number;
}