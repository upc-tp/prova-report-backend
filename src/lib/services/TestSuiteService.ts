import { plainToClass } from "class-transformer";
import { container, singleton } from "tsyringe";
import { In } from "typeorm";
import { BusinessError } from "../common/business-error";
import { ProvaConstants } from "../common/constants";
import { StringUtils } from "../common/StringUtils";
import { DatabaseManager } from "../database/DatabaseManager";
import { TestSuiteSaveDTO } from "../dtos/test-suite/TestSuiteSaveDTO";
import { TestSuiteUpdateDTO } from "../dtos/test-suite/TestSuiteUpdateDTO";
import { UserClaims } from "../interfaces/UserClaims";
import { TestCase } from "../models/TestCase.entity";
import { TestSuite } from "../models/TestSuite.entity";
import { PriorityRepository } from "../repositories/PriorityRepository";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { SeverityRepository } from "../repositories/SeverityRepository";
import { TestCaseRepository } from "../repositories/TestCaseRepository";
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
                .leftJoin("users_projects", "up", "up.project_id = p.id")
                .where(`t.deleted_at is null`);

            const userClaims = container.resolve(UserClaims);
            if (userClaims.payload.uid) {
                qb.andWhere(`up.user_id = ${userClaims.payload.uid}`);
            }
            if (search) {
                qb.andWhere(`concat(t.title,t.description) like '%${search}%'`);
            }
            if (projectId) {
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

    async importCSV(projectId: number, csv: string): Promise<any> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const projectRepo = transactionalEntityManager.getCustomRepository(ProjectRepository);
                const testSuiteRepo = transactionalEntityManager.getCustomRepository(TestSuiteRepository);
                const testCaseRepo = transactionalEntityManager.getCustomRepository(TestCaseRepository);
                const testStateRepo = transactionalEntityManager.getCustomRepository(TestStateRepository);
                const priorityRepo = transactionalEntityManager.getCustomRepository(PriorityRepository);
                const severityRepo = transactionalEntityManager.getCustomRepository(SeverityRepository);

                if (isNaN(projectId)) {
                    throw new BusinessError('Debe indicar el ?projectId como query parameter', 400);
                }

                //Leer datos de CSV
                const lines = csv.split(/\r\n|\n/);
                console.log(lines);
                let data = [];
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    const entries = StringUtils.csvRowToArray(line, ',', '"');
                    const type = entries[0];
                    const title = entries[1].replace('"', ''); // Si tiene el text qualifier "" lo elimina
                    const description = entries[2].replace('"', '');
                    if (type === 'ST') {
                        // Guardar suite de prueba
                        data.push({
                            type,
                            title,
                            description,
                            testCases: []
                        });
                    } else {
                        // Guardar caso de prueba en el ultimo suite registrado
                        const lastSuite = data[data.length - 1];
                        const priorityId = parseInt(entries[3]);
                        const severityId = parseInt(entries[4]);
                        lastSuite.testCases.push({
                            type,
                            title,
                            description,
                            priorityId,
                            severityId
                        });
                    }
                }

                const project = await projectRepo.findOne(projectId);
                if (!project) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Projects', projectId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                const stateId = ProvaConstants.TEST_STATE_NOT_EXECUTED;
                const state = await testStateRepo.findOne(stateId);
                if (!state) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test States', stateId.toString()), 404);
                    return Promise.reject(notFoundError);
                }

                let newSuiteIds: number[] = [];

                for (const suite of data) {
                    let newSuite = new TestSuite();
                    newSuite.title = suite.title;
                    newSuite.description = suite.description;
                    newSuite.project = project;
                    newSuite.testState = state;
                    newSuite = await testSuiteRepo.save(newSuite);
                    if (suite.testCases.length > 0) {
                        for (const tc of suite.testCases) {
                            const priority = await priorityRepo.findOne(tc.priorityId);
                            if (!priority) {
                                const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Priority', tc.priorityId.toString()), 404);
                                return Promise.reject(notFoundError);
                            }
                            const severity = await severityRepo.findOne(tc.severityId);
                            if (!severity) {
                                const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Severity', tc.severityId.toString()), 404);
                                return Promise.reject(notFoundError);
                            }
                            let newTest = new TestCase();
                            newTest.title = tc.title;
                            newTest.description = tc.description;
                            newTest.testState = state;
                            newTest.testSuite = newSuite;
                            newTest.priority = priority;
                            newTest.severity = severity;
                            await testCaseRepo.save(newTest);
                        }
                    }
                    newSuiteIds.push(newSuite.id);
                }

                const entities = await testSuiteRepo.find({
                    where: {
                        id: In(newSuiteIds)
                    },
                    relations: [
                        "testCases",
                        "testCases.priority",
                        "testCases.severity"
                    ]
                });

                return entities;
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