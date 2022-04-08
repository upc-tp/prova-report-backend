import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";
import { UserProject } from "./UserProject.entity";

@Entity({
    name: 'projects'
})
export class Project extends AuditEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @OneToMany(() => UserProject, up => up.project)
    userProjects: UserProject[];

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

    @Column({
        type: 'int',
        name: 'last_version'
    })
    lastVersion: number;
}