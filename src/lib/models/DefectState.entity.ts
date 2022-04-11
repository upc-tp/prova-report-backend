import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";

@Entity({
    name: 'defect_states'
})
export class DefectState extends AuditEntity{
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