import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";

@Entity({
    name: 'test_states'
})
export class TestState {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @Column({
        type: 'varchar',
        length: 64
    })
    name: string;
}