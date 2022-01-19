import { plainToClass } from "class-transformer";
import { container, singleton } from "tsyringe";
import { BusinessError } from "../common/business-error";
import { ProvaConstants } from "../common/constants";
import { StringUtils } from "../common/StringUtils";
import { DatabaseManager } from "../database/DatabaseManager";
import { TestSuiteSaveDTO } from "../dtos/TestSuiteSaveDTO";
import { TestSuiteUpdateDTO } from "../dtos/TestSuiteUpdateDTO";
import { TestSuite } from "../models/TestSuite.entity";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { TestStateRepository } from "../repositories/TestStateRepository";
import { TestSuiteRepository } from "../repositories/TestSuiteRepository";

@singleton()
export class TestSuiteService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getPaged(page: number, pageSize: number, sortOrder: string = ProvaConstants.SORT_ORDER_DESC, search: string, projectId: number = null): Promise<[TestSuite[], number]> {
        try {
            const conn = await this._database.getConnection();
            const skip = (page - 1) * pageSize;
            const testSuiteRepo = conn.getCustomRepository(TestSuiteRepository);
            const qb = testSuiteRepo.createQueryBuilder("t")
                .innerJoinAndSelect('t.testState', 'ts')
                .innerJoinAndSelect('t.project', 'p')
                .where(`t.deleted_at is null`);
            if (search) {
                qb.andWhere(`concat(t.title,t.description) like '%${search}%'`);
            }
            if(projectId) {
                qb.andWhere(`t.project_id = ${projectId}`);
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

    async getById(id: number): Promise<TestSuite> {
        try {
            const conn = await this._database.getConnection();
            const testSuiteRepo = conn.getCustomRepository(TestSuiteRepository);
            const suite = await testSuiteRepo.findOne({ id }, {
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
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async save(dto: TestSuiteSaveDTO): Promise<TestSuite> {
        try {
            const conn = await this._database.getConnection();
            const entity = plainToClass(TestSuite, dto);
            return await conn.transaction(async transactionalEntityManager => {
                const projectRepo = transactionalEntityManager.getCustomRepository(ProjectRepository);
                const testSuiteRepo = transactionalEntityManager.getCustomRepository(TestSuiteRepository);
                const testStateRepo = transactionalEntityManager.getCustomRepository(TestStateRepository);
                const project = await projectRepo.findOne(dto.projectId);
                if (!project) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Projects', dto.projectId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                entity.project = project;
                const stateId = ProvaConstants.TEST_STATE_NOT_EXECUTED;
                const state = await testStateRepo.findOne(stateId);
                if (!state) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test States', stateId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                entity.testState = state;
                console.log("Creating test suite:");
                console.log(entity);
                const testSuite = testSuiteRepo.save(entity);
                console.log("Test Suite saved successfully");
                return testSuite;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async update(id: number, dto: TestSuiteUpdateDTO): Promise<TestSuite> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const testSuiteRepo = transactionalEntityManager.getCustomRepository(TestSuiteRepository);
                const entity = await testSuiteRepo.findOne(id);
                if (!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Suites', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                console.log("Updating test suite:");
                entity.title = dto.title;
                entity.description = dto.description;
                console.log(entity);
                const testSuite = await testSuiteRepo.save(entity);
                console.log("Test Suite updated successfully");
                return testSuite;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }
}