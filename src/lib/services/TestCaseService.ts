import { plainToClass } from "class-transformer";
import { container, singleton } from "tsyringe";
import { BusinessError } from "../common/business-error";
import { ProvaConstants } from "../common/constants";
import { StringUtils } from "../common/StringUtils";
import { DatabaseManager } from "../database/DatabaseManager";
import { TestCaseSaveDTO } from "../dtos/test-case/TestCaseSaveDTO";
import { TestCaseUpdateDTO } from "../dtos/test-case/TestCaseUpdateDTO";
import { TestCase } from "../models/TestCase.entity";
import { TestCaseRepository } from "../repositories/TestCaseRepository";
import { TestStateRepository } from "../repositories/TestStateRepository";
import { TestSuiteRepository } from "../repositories/TestSuiteRepository";

@singleton()
export class TestCaseService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getPaged(page: number, pageSize: number, sortOrder: string = ProvaConstants.SORT_ORDER_DESC, search: string, testCaseId: number = null): Promise<[TestCase[], number]> {
        try {
            const conn = await this._database.getConnection();
            const skip = (page - 1) * pageSize;
            const testCaseRepo = conn.getCustomRepository(TestCaseRepository);
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
                "t.id": sortOrder as any
            });
            if (page && pageSize) {
                qb.skip(skip);
                qb.take(pageSize);
            }
            const result = await qb.getManyAndCount();
            return result;
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async getById(id: number): Promise<TestCase> {
        try {
            const conn = await this._database.getConnection();
            const testCaseRepo = conn.getCustomRepository(TestCaseRepository);
            const testCase = await testCaseRepo.findOne({ id }, {
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
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async save(dto: TestCaseSaveDTO): Promise<TestCase> {
        try {
            const conn = await this._database.getConnection();
            const entity = plainToClass(TestCase, dto);
            return await conn.transaction(async transactionalEntityManager => {
                const testCaseRepo = transactionalEntityManager.getCustomRepository(TestCaseRepository);
                const testSuiteRepo = transactionalEntityManager.getCustomRepository(TestSuiteRepository);
                const testStateRepo = transactionalEntityManager.getCustomRepository(TestStateRepository);
                const testSuite = await testSuiteRepo.findOne(dto.testSuiteId);
                if (!testSuite) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Suites', dto.testSuiteId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                entity.testSuite = testSuite;
                const stateId = ProvaConstants.TEST_STATE_NOT_EXECUTED;
                const state = await testStateRepo.findOne(stateId);
                if (!state) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test States', stateId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                entity.testState = state;
                console.log("Creating test case:");
                console.log(entity);
                const testCase = testCaseRepo.save(entity);
                console.log("Test case saved successfully");
                return testCase;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async update(id: number, dto: TestCaseUpdateDTO): Promise<TestCase> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const testCaseRepo = transactionalEntityManager.getCustomRepository(TestCaseRepository);
                const entity = await testCaseRepo.findOne(id);
                if (!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Cases', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                console.log("Updating test case:");
                entity.title = dto.title;
                entity.description = dto.description;
                console.log(entity);
                const testCase = await testCaseRepo.save(entity);
                console.log("Test case updated successfully");
                return testCase;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }
}