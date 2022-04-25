import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity} from "./AuditEntity.entity";
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

    @Column({
        type: 'varchar',
        length: 256
    })
    description: string;
 
}