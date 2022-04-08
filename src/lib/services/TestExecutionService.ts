import { plainToClass } from "class-transformer";
import { singleton, container } from "tsyringe";
import { TransactionAlreadyStartedError } from "typeorm";
import { BusinessError } from "../common/business-error";
import { ProvaConstants } from "../common/constants";
import { StringUtils } from "../common/StringUtils";
import { DatabaseManager } from "../database/DatabaseManager";
import { TestExecutionSaveDTO } from "../dtos/test-execution/TestExecutionSaveDTO";
import { TestExecutionUpdateDTO } from "../dtos/test-execution/TestExecutionUpdateDTO";
import { TestExecution } from "../models/TestExecution.entity";
import { TestCaseRepository } from "../repositories/TestCaseRepository";
import { TestExecutionRepository } from "../repositories/TestExecutionRepository";
import { TestStateRepository } from "../repositories/TestStateRepository";

@singleton()
export class TestExecutionService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getPaged(page: number, pageSize: number, sortOrder: string = ProvaConstants.SORT_ORDER_ASC, search: string, testCaseId: number = null): Promise<[TestExecution[], number]> {
        try {
            const conn = await this._database.getConnection();
            const skip = (page - 1) * pageSize;
            const testExecutionRepo = conn.getCustomRepository(TestExecutionRepository);
            const qb = testExecutionRepo.createQueryBuilder("t")
                .innerJoinAndSelect('t.testState', 'ts')
                .innerJoinAndSelect('t.testCase', 'tc')
                .where(`t.deleted_at is null`);
            if (search) {
                qb.andWhere(`concat(t.order, t.duration) like '%${search}%`);
            }
            if (testCaseId) {
                qb.andWhere(`t.test_case_id = ${testCaseId}`);
            }

            qb.orderBy({
                "t.id": sortOrder as any
            });
            if(page && pageSize) {
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

    async getById(id: number): Promise<any> {
        try {
            const conn = await this._database.getConnection();
            const testExecutionRepo = conn.getCustomRepository(TestExecutionRepository);
            const testExecution = await testExecutionRepo.findOne({ id }, {
                where: {
                    deletedAt: null,
                },
                relations: [
                    "testCase",
                    "testState"
                ],
                withDeleted: true
            });
            return testExecution;
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async save(dto: TestExecutionSaveDTO): Promise<TestExecution> {
        try {
            const conn = await this._database.getConnection();
            const entity = plainToClass(TestExecution, dto);
            return await conn.transaction(async transactionalEntityManager => {
                const testCaseRepo = transactionalEntityManager.getCustomRepository(TestCaseRepository);
                const testExecutionRepo = transactionalEntityManager.getCustomRepository(TestExecutionRepository);
                const testStateRepo = transactionalEntityManager.getCustomRepository(TestStateRepository);
                const testCase = await testCaseRepo.findOne(dto.testCaseId);
                if(!testCase) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Cases', dto.testCaseId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                entity.testCase = testCase;
                const stateId = ProvaConstants.TEST_STATE_NOT_EXECUTED;
                const state = await testStateRepo.findOne(stateId);
                if(!state) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test States', stateId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                entity.testState = state;
                console.log("Creating test execution: ");
                console.log(entity);
                const testExecution = testExecutionRepo.save(entity);
                console.log("Test Execution saved");
                return testExecution;
            }).catch(error => {
                return Promise.reject(error);
            });
            
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async update(id: number, dto: TestExecutionUpdateDTO): Promise<TestExecution> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const testExecutionRepo = transactionalEntityManager.getCustomRepository(TestExecutionRepository);
                const entity = await testExecutionRepo.findOne(id);
                if(!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Executions', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                console.log("Updating test execution:");
                entity.order = dto.order;
                /*entity.startTime = dto.startTime;
                entity.endTime = dto.endTime;
                entity.duration = dto.duration;*/
                console.log(entity);
                const testExecution = await testExecutionRepo.save(entity);
                console.log("Test execution updated");
                return testExecution;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch(error) {
            console.error(error);
            return Promise.reject(error);
        }
    }
}