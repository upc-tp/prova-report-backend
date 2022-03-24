import { Column, Entity, PrimaryColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";

@Entity({
    name: 'severities'
})
export class Severity extends AuditEntity {
    @PrimaryColumn({
        type: 'int'
    })
    id: number;

    @Column({
        type: 'varchar',
        length: 32
    })
    name: string;
}