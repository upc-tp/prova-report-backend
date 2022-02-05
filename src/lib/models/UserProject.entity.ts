import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";
import { Project } from "./Project.entity";
import { User } from "./User.entity";

@Entity({
    name: 'users_projects'
})
export class UserProject extends AuditEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @ManyToOne(() => User, user => user.userProjects)
    user: User;

    @ManyToOne(() => Project, project => project.userProjects)
    project: Project;

    @Column({
        name: 'access_type',
        type: 'varchar',
        length: 32
    })
    accessType: string;
}