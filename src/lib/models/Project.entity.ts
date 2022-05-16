import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";
import { TestPlan } from "./TestPlan.entity";
import { TestSuite } from "./TestSuite.entity";
import { UserProject } from "./UserProject.entity";
import { UserStory } from "./UserStory.entity";

@Entity({
    name: 'projects'
})
export class Project extends AuditEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

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

    @OneToMany(() => UserProject, up => up.project, {
        cascade: true
    })
    userProjects: UserProject[];

    @OneToMany(() => TestPlan, s => s.project, {
        cascade: true
    })
    testPlans: TestPlan[];

    @OneToMany(() => TestSuite, ts => ts.project, {
        cascade: true
    })
    testSuites: TestSuite[];

    @OneToMany(() => UserStory, us => us.project, {
        cascade: true
    })
    userStories: UserStory[];
}