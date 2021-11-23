"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestSuiteService = void 0;
const class_transformer_1 = require("class-transformer");
const tsyringe_1 = require("tsyringe");
const business_error_1 = require("../common/business-error");
const constants_1 = require("../common/constants");
const StringUtils_1 = require("../common/StringUtils");
const DatabaseManager_1 = require("../database/DatabaseManager");
const TestSuite_entity_1 = require("../models/TestSuite.entity");
const ProjectRepository_1 = require("../repositories/ProjectRepository");
const TestStateRepository_1 = require("../repositories/TestStateRepository");
const TestSuiteRepository_1 = require("../repositories/TestSuiteRepository");
let TestSuiteService = class TestSuiteService {
    constructor() {
        this._database = tsyringe_1.container.resolve(DatabaseManager_1.DatabaseManager);
    }
    getPaged(page, pageSize, sortOrder = constants_1.ProvaConstants.SORT_ORDER_DESC, search) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield this._database.getConnection();
                const skip = (page - 1) * pageSize;
                const testSuiteRepo = conn.getCustomRepository(TestSuiteRepository_1.TestSuiteRepository);
                const qb = testSuiteRepo.createQueryBuilder("t")
                    //.innerJoinAndSelect('t.testState', 'ts')
                    .innerJoinAndSelect('t.project', 'p')
                    .where(`t.deleted_at is null`);
                if (search) {
                    qb.andWhere(`concat(t.title,t.description) like '%${search}%'`);
                }
                qb.orderBy({
                    "t.id": sortOrder
                });
                if (page && pageSize) {
                    qb.skip(skip);
                    qb.take(pageSize);
                }
                const result = yield qb.getManyAndCount();
                return result;
            }
            catch (error) {
                console.error(error);
                return Promise.reject(error);
            }
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield this._database.getConnection();
                const testSuiteRepo = conn.getCustomRepository(TestSuiteRepository_1.TestSuiteRepository);
                const suite = yield testSuiteRepo.findOne({ id }, {
                    where: {
                        deletedAt: null,
                    },
                    relations: [
                        "project",
                        "testState",
                    ],
                    withDeleted: true
                });
                return suite;
            }
            catch (error) {
                console.error(error);
                return Promise.reject(error);
            }
        });
    }
    save(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield this._database.getConnection();
                const entity = (0, class_transformer_1.plainToClass)(TestSuite_entity_1.TestSuite, dto);
                return yield conn.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                    const projectRepo = transactionalEntityManager.getCustomRepository(ProjectRepository_1.ProjectRepository);
                    const testSuiteRepo = transactionalEntityManager.getCustomRepository(TestSuiteRepository_1.TestSuiteRepository);
                    const testStateRepo = transactionalEntityManager.getCustomRepository(TestStateRepository_1.TestStateRepository);
                    const project = yield projectRepo.findOne(dto.projectId);
                    if (!project) {
                        const notFoundError = new business_error_1.BusinessError(StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Projects', dto.projectId.toString()), 404);
                        return Promise.reject(notFoundError);
                    }
                    entity.project = project;
                    const stateId = constants_1.ProvaConstants.TEST_STATE_NOT_EXECUTED;
                    const state = yield testStateRepo.findOne(stateId);
                    if (!state) {
                        const notFoundError = new business_error_1.BusinessError(StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test States', stateId.toString()), 404);
                        return Promise.reject(notFoundError);
                    }
                    entity.testState = state;
                    console.log("Creating test suite:");
                    console.log(entity);
                    const testSuite = testSuiteRepo.save(entity);
                    console.log("Test Suite saved successfully");
                    return testSuite;
                })).catch(error => {
                    return Promise.reject(error);
                });
            }
            catch (error) {
                console.error(error);
                return Promise.reject(error);
            }
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield this._database.getConnection();
                return yield conn.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                    const testSuiteRepo = transactionalEntityManager.getCustomRepository(TestSuiteRepository_1.TestSuiteRepository);
                    const entity = yield testSuiteRepo.findOne(id);
                    if (!entity) {
                        const notFoundError = new business_error_1.BusinessError(StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Suites', id.toString()), 404);
                        return Promise.reject(notFoundError);
                    }
                    console.log("Updating test suite:");
                    entity.title = dto.title;
                    entity.description = dto.description;
                    console.log(entity);
                    const testSuite = yield testSuiteRepo.save(entity);
                    console.log("Test Suite updated successfully");
                    return testSuite;
                })).catch(error => {
                    return Promise.reject(error);
                });
            }
            catch (error) {
                console.error(error);
                return Promise.reject(error);
            }
        });
    }
};
TestSuiteService = __decorate([
    (0, tsyringe_1.singleton)()
], TestSuiteService);
exports.TestSuiteService = TestSuiteService;
//# sourceMappingURL=TestSuiteService.js.map