"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCase = void 0;
const typeorm_1 = require("typeorm");
const AuditEntity_entity_1 = require("./AuditEntity.entity");
const TestState_entity_1 = require("./TestState.entity");
const TestSuite_entity_1 = require("./TestSuite.entity");
let TestCase = class TestCase extends AuditEntity_entity_1.AuditEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: 'int'
    })
], TestCase.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => TestSuite_entity_1.TestSuite),
    (0, typeorm_1.JoinColumn)({
        name: 'test_suite_id',
        referencedColumnName: 'id'
    })
], TestCase.prototype, "testSuite", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => TestState_entity_1.TestState),
    (0, typeorm_1.JoinColumn)({
        name: 'test_state_id',
        referencedColumnName: 'id'
    })
], TestCase.prototype, "testState", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 64
    })
], TestCase.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 128
    })
], TestCase.prototype, "description", void 0);
TestCase = __decorate([
    (0, typeorm_1.Entity)({
        name: 'test_cases'
    })
], TestCase);
exports.TestCase = TestCase;
//# sourceMappingURL=TestCase.entity.js.map