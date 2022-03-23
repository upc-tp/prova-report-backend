import { container } from 'tsyringe';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateDateColumn,
  UpdateEvent,
} from 'typeorm';
import { UserClaims } from '../interfaces/UserClaims';
import { User } from './User.entity';


@EventSubscriber()
export abstract class AuditEntity implements EntitySubscriberInterface {

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
  })
  createdAt: Date;

  @Column({
    name: "created_by",
    type: "varchar",
    length: 64,
  })
  createdBy: string;

  @UpdateDateColumn({
    name: "modified_at",
    type: "timestamp",
  })
  modifiedAt: Date;

  @Column({
    name: "modified_by",
    type: "varchar",
    length: 64,
  })
  modifiedBy: string;

  @DeleteDateColumn({
    name: "deleted_at",
    type: "timestamp",
  })
  deletedAt: Date;

  @Column({
    name: "deleted_by",
    type: "varchar",
    length: 64,
  })
  deletedBy: string;

  beforeInsert(event: InsertEvent<any>) {
    const userClaims = container.resolve(UserClaims);
    if (!(event.entity instanceof User)) { // When insert a user there are no claims yet.
      event.entity.createdBy = userClaims.payload.email;
    }
  }

  beforeUpdate(event: UpdateEvent<any>) {
    const userClaims = container.resolve(UserClaims);
    event.entity.modifiedBy = userClaims.payload.email;
  }
}
