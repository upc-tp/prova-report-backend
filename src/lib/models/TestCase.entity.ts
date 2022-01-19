import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";
import { TestState } from "./TestState.entity";
import { TestSuite } from "./TestSuite.entity";

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