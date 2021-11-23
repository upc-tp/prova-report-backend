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
    event.entity.createdBy = 'backend-dev';//container.resolve(UserClaims).userName;
  }

  beforeUpdate(event: UpdateEvent<any>) {
    event.entity.modifiedBy = 'backend-dev';//container.resolve(UserClaims).userName;
  }
}
