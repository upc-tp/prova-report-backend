import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "./AuditEntity.entity";
import { UserProject } from "./UserProject.entity";


@Entity({
    name: 'users'
})
export class User extends AuditEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @OneToMany(() => UserProject, up => up.user)
    @JoinColumn({
        name: 'user_id',
        referencedColumnName: 'id'
    })
    userProjects: UserProject[];

    @Column({
        type: 'varchar',
        name: 'role',
        length: 128
    })
    role: 'Admin' | 'Tester';

    @Column({
        type: 'varchar',
        name: 'first_name',
        length: 128
    })
    firstName: string;

    @Column({
        type: 'varchar',
        name: 'last_name',
        length: 128
    })
    lastName: string;

    @Column({
        type: 'varchar',
        name: 'email',
        length: 128
    })
    email: string;

    @Column({
        type: 'varchar',
        name: 'password',
        length: 128
    })
    password: string;
}