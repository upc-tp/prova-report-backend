"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditEntity = void 0;
const typeorm_1 = require("typeorm");
let AuditEntity = class AuditEntity {
    beforeInsert(event) {
        event.entity.createdBy = 'backend-dev'; //container.resolve(UserClaims).userName;
    }
    beforeUpdate(event) {
        event.entity.modifiedBy = 'backend-dev'; //container.resolve(UserClaims).userName;
    }
};
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: "created_at",
        type: "timestamp",
    })
], AuditEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "created_by",
        type: "varchar",
        length: 64,
    })
], AuditEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: "modified_at",
        type: "timestamp",
    })
], AuditEntity.prototype, "modifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "modified_by",
        type: "varchar",
        length: 64,
    })
], AuditEntity.prototype, "modifiedBy", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        name: "deleted_at",
        type: "timestamp",
    })
], AuditEntity.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "deleted_by",
        type: "varchar",
        length: 64,
    })
], AuditEntity.prototype, "deletedBy", void 0);
AuditEntity = __decorate([
    (0, typeorm_1.EventSubscriber)()
], AuditEntity);
exports.AuditEntity = AuditEntity;
//# sourceMappingURL=AuditEntity.entity.js.map