
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity} from "./AuditEntity.entity";
import { Project } from "./Project.entity";
import { TestCase } from "./TestCase.entity";
import { UserStory } from "./UserStory.entity";

@Entity({
    name: 'user_story_criterias'
})
export class UserStoryCriteria extends AuditEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @ManyToOne(type => UserStory)
    @JoinColumn({
        name: 'user_story_id',
        referencedColumnName: 'id'
    })
    userStory: UserStory;

    @OneToOne(() => TestCase, testCase => testCase.userStoryCriteria)
    @JoinColumn({
        name: 'test_case_id',
        referencedColumnName: 'id'
    })
    testCase: TestCase;

    @Column({
        type: 'varchar',
        length: 256
    })
    description: string;
 
}