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
exports.TestCaseService = void 0;
const class_transformer_1 = require("class-transformer");
const tsyringe_1 = require("tsyringe");
const business_error_1 = require("../common/business-error");
const constants_1 = require("../common/constants");
const StringUtils_1 = require("../common/StringUtils");
const DatabaseManager_1 = require("../database/DatabaseManager");
const TestCase_entity_1 = require("../models/TestCase.entity");
const TestCaseRepository_1 = require("../repositories/TestCaseRepository");
const TestStateRepository_1 = require("../repositories/TestStateRepository");
const TestSuiteRepository_1 = require("../repositories/TestSuiteRepository");
let TestCaseService = class TestCaseService {
    constructor() {
        this._database = tsyringe_1.container.resolve(DatabaseManager_1.DatabaseManager);
    }
    getPaged(page, pageSize, sortOrder = constants_1.ProvaConstants.SORT_ORDER_DESC, search, testCaseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield this._database.getConnection();
                const skip = (page - 1) * pageSize;
                const testCaseRepo = conn.getCustomRepository(TestCaseRepository_1.TestCaseRepository);
                const qb = testCaseRepo.createQueryBuilder("t")
                    .innerJoinAndSelect('t.testState', 'ts')
                    .innerJoinAndSelect('t.testSuite', 'tst')
                    .where(`t.deleted_at is null`);
                if (search) {
                    qb.andWhere(`concat(t.title,t.description) like '%${search}%'`);
                }
                if (testCaseId) {
                    qb.andWhere(`t.test_suite_id = ${testCaseId}`);
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
                const testCaseRepo = conn.getCustomRepository(TestCaseRepository_1.TestCaseRepository);
                const testCase = yield testCaseRepo.findOne({ id }, {
                    where: {
                        deletedAt: null,
                    },
                    relations: [
                        "testSuite",
                        "testState",
                    ],
                    withDeleted: true
                });
                return testCase;
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
                const entity = (0, class_transformer_1.plainToClass)(TestCase_entity_1.TestCase, dto);
                return yield conn.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                    const testCaseRepo = transactionalEntityManager.getCustomRepository(TestCaseRepository_1.TestCaseRepository);
                    const testSuiteRepo = transactionalEntityManager.getCustomRepository(TestSuiteRepository_1.TestSuiteRepository);
                    const testStateRepo = transactionalEntityManager.getCustomRepository(TestStateRepository_1.TestStateRepository);
                    const testSuite = yield testSuiteRepo.findOne(dto.testSuiteId);
                    if (!testSuite) {
                        const notFoundError = new business_error_1.BusinessError(StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Suites', dto.testSuiteId.toString()), 404);
                        return Promise.reject(notFoundError);
                    }
                    entity.testSuite = testSuite;
                    const stateId = constants_1.ProvaConstants.TEST_STATE_NOT_EXECUTED;
                    const state = yield testStateRepo.findOne(stateId);
                    if (!state) {
                        const notFoundError = new business_error_1.BusinessError(StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test States', stateId.toString()), 404);
                        return Promise.reject(notFoundError);
                    }
                    entity.testState = state;
                    console.log("Creating test case:");
                    console.log(entity);
                    const testCase = testCaseRepo.save(entity);
                    console.log("Test case saved successfully");
                    return testCase;
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
                    const testCaseRepo = transactionalEntityManager.getCustomRepository(TestCaseRepository_1.TestCaseRepository);
                    const entity = yield testCaseRepo.findOne(id);
                    if (!entity) {
                        const notFoundError = new business_error_1.BusinessError(StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Cases', id.toString()), 404);
                        return Promise.reject(notFoundError);
                    }
                    console.log("Updating test case:");
                    entity.title = dto.title;
                    entity.description = dto.description;
                    console.log(entity);
                    const testCase = yield testCaseRepo.save(entity);
                    console.log("Test case updated successfully");
                    return testCase;
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
TestCaseService = __decorate([
    (0, tsyringe_1.singleton)()
], TestCaseService);
exports.TestCaseService = TestCaseService;
//# sourceMappingURL=TestCaseService.js.map