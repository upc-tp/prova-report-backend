import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity} from "./AuditEntity.entity";
import { Project } from "./Project.entity";
import { UserStoryCriteria } from "./UserStoryCriteria.entity";

@Entity({
    name: 'user_stories'
})
export class UserStory extends AuditEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @ManyToOne(type => Project)
    @JoinColumn({
        name: 'project_id',
        referencedColumnName: 'id'
    })
    project: Project;

    @Column({
        type: 'varchar',
        length: 128
    })
    name: string;

    @Column({
        type: 'varchar',
        length: 256
    })
    description: string;

    @OneToMany(() => UserStoryCriteria, s => s.userStory, {
        cascade: true
    })
    userStoryCriterias: UserStoryCriteria[];
}