import mysql = require('mysql');
import { plainToClass } from "class-transformer";
import { container, singleton } from "tsyringe";
import { BusinessError } from "../common/business-error";
import { ProvaConstants } from "../common/constants";
import { StringUtils } from "../common/StringUtils";
import { DatabaseManager } from "../database/DatabaseManager";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { TestPlanRepository } from "../repositories/TestPlanRepository";
import { TestPlan } from "../models/TestPlan.entity";
import { TestPlanSaveDTO } from "../dtos/test-plan/TestPlanSaveDTO";
import { TestPlanUpdateDTO } from "../dtos/test-plan/TestPlanUpdateDTO";
import { UserClaims } from "../interfaces/UserClaims";
import { VersionsRepository } from "../repositories/VersionsRepository";
import { generatePDF } from "../reports/Pdf";
import { UserStoryRepository } from "../repositories/UserStoryRepository";
import { TestCaseRepository } from "../repositories/TestCaseRepository";
import { DefectRepository } from "../repositories/DefectRepository";

@singleton()
export class TestPlanService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getPaged(page: number, pageSize: number, sortOrder: string = ProvaConstants.SORT_ORDER_DESC, search: string, projectId: number = null): Promise<[TestPlan[], number]> {
        try {
            const conn = await this._database.getConnection();
            const skip = (page - 1) * pageSize;
            const testPlanRepo = conn.getCustomRepository(TestPlanRepository);
            const qb = testPlanRepo.createQueryBuilder("t")
                .leftJoinAndSelect('t.version', 'v')
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

    async getById(id: number): Promise<TestPlan> {
        try {
            const conn = await this._database.getConnection();
            const testPlanRepo = conn.getCustomRepository(TestPlanRepository);
            const plan = await testPlanRepo.findOne({ id }, {
                where: {
                    deletedAt: null,
                },
                relations: [
                    "project",
                    "version"
                ]
            });
            return plan;
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async save(dto: TestPlanSaveDTO): Promise<TestPlan> {
        try {
            const conn = await this._database.getConnection();
            const entity = plainToClass(TestPlan, dto);
            return await conn.transaction(async transactionalEntityManager => {
                const projectRepo = transactionalEntityManager.getCustomRepository(ProjectRepository);
                const testPlanRepo = transactionalEntityManager.getCustomRepository(TestPlanRepository);
                const versionRepo = transactionalEntityManager.getCustomRepository(VersionsRepository);
                const project = await projectRepo.findOne(dto.projectId);
                if (!project) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Projects', dto.projectId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                entity.project = project;

                const alreadyExists = await testPlanRepo.createQueryBuilder("tp")
                    .where("tp.title = :title and tp.project_id = :projectId", { title: dto.title, projectId: project.id })
                    .getCount() > 0;
                if (alreadyExists) {
                    throw new BusinessError(`El plan de prueba con título "${dto.title}" ya se encuentra registrado en el proyecto`, 400);
                }

                if (dto.versionId > 0) {
                    const version = await versionRepo.findOne(dto.versionId);
                    if (!version) {
                        const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Version', dto.versionId.toString()), 404);
                        return Promise.reject(notFoundError);
                    }
                    entity.version = version;
                } else {
                    entity.version = null;
                }
                console.log("Creating test plan:");
                console.log(entity);
                const testPlan = testPlanRepo.save(entity);
                console.log("Test Plan saved successfully");
                return testPlan;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async update(id: number, dto: TestPlanUpdateDTO): Promise<TestPlan> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const projectRepo = transactionalEntityManager.getCustomRepository(ProjectRepository);
                const testPlanRepo = transactionalEntityManager.getCustomRepository(TestPlanRepository);
                const versionRepo = transactionalEntityManager.getCustomRepository(VersionsRepository);
                const entity = await testPlanRepo.findOne(id);
                if (!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Plan', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                const project = await projectRepo.findOne(dto.projectId);
                if (!project) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Projects', dto.projectId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                entity.project = project;

                if (entity.title !== dto.title) {
                    const alreadyExists = await testPlanRepo.createQueryBuilder("tp")
                        .where("tp.title = :title and tp.project_id = :projectId", { title: dto.title, projectId: project.id })
                        .getCount() > 0;
                    if (alreadyExists) {
                        throw new BusinessError(`El plan de prueba con título "${dto.title}" ya se encuentra registrado en el proyecto`, 400);
                    }
                }

                if (dto.versionId > 0) {
                    const version = await versionRepo.findOne(dto.versionId);
                    if (!version) {
                        const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Version', dto.versionId.toString()), 404);
                        return Promise.reject(notFoundError);
                    }
                    entity.version = version;
                } else {
                    entity.version = null;
                }
                console.log("Updating test plan:");
                entity.title = dto.title;
                entity.description = dto.description;
                console.log(entity);
                const testPlan = await testPlanRepo.save(entity);
                console.log("Test Plan updated successfully");
                return testPlan;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async getPdf(id: number, reportDate: string): Promise<TestPlan> {
        try {
            const conn = await this._database.getConnection();
            const testPlanRepo = conn.getCustomRepository(TestPlanRepository);
            const testCaseRepo = conn.getCustomRepository(TestCaseRepository);
            const defectRepo = conn.getCustomRepository(DefectRepository);
            const userStoryRepo = conn.getCustomRepository(UserStoryRepository);

            const testPlan = await testPlanRepo.findOne(id, {
                relations: [
                    "project",
                    "version"
                ]
            });
            if (!testPlan) {
                const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Plan', id.toString()), 404);
                return Promise.reject(notFoundError);
            }

            const userStoriesPromise = await userStoryRepo.find({
                where: {
                    testPlan: {
                        id
                    }
                },
                relations: [
                    "userStoryCriterias",
                    "userStoryCriterias.testCase"
                ]
            });

            const defectsPromise = await defectRepo.find({
                where: {
                    testCase: {
                        testSuite: {
                            testPlan: {
                                id
                            }
                        }
                    }
                },
                relations: [
                    "testCase",
                    "testCase.testSuite",
                    "defectState",
                    "priority",
                    "severity"
                ]
            })

            const testCasesPromise = await testCaseRepo.find({
                where: {
                    testSuite: {
                        testPlan: {
                            id
                        }
                    }
                },
                relations: [
                    "testSuite"
                ]
            });

            const [userStories, testCases, defects] = await Promise.all([
                userStoriesPromise,
                testCasesPromise,
                defectsPromise
            ]);

            const totalStoriesPromise = conn.query(`SELECT 
            COUNT(*) as total_stories 
            FROM user_stories as us
            where test_plan_id = ${mysql.escape(testPlan.id)};`);

            const coveredStoriesPromise = conn.query(`
            SELECT COUNT(*) as covered_stories FROM 
            (SELECT us.id, us.tag, us.name,
            COUNT(usc.id) as criterias,
            COUNT(te.id) as executions
            FROM user_stories as us
            left join user_story_criterias as usc
            on usc.user_story_id = us.id
            inner join test_cases as tc
            on tc.id = usc.test_case_id
            left join test_executions as te
            on te.test_case_id = tc.id
            where us.test_plan_id = ${mysql.escape(testPlan.id)}
            group by us.id, us.tag, us.name) as stories
            where stories.criterias = stories.executions;`);

            const totalTestsPromise = conn.query(`
            select COUNT(*) as total_tests from test_cases as tc
            inner join test_suites as ts
            on ts.id = tc.test_suite_id
            where ts.test_plan_id = ${mysql.escape(testPlan.id)};
            `);

            const assignedTestsPromise = conn.query(`select COUNT(*) as assigned_tests from test_cases as tc
            inner join test_suites as ts
            on ts.id = tc.test_suite_id
            inner join user_story_criterias as usc
            on usc.test_case_id = tc.id
            where ts.test_plan_id = ${mysql.escape(testPlan.id)};`);

            const executedTestsPromise = conn.query(`select COUNT(*) as executed_tests from test_cases as tc
            inner join test_suites as ts
            on ts.id = tc.test_suite_id
            inner join test_executions as te
            on te.test_case_id = tc.id
            where ts.test_plan_id = ${mysql.escape(testPlan.id)};`);

            const results = await Promise.all([
                totalStoriesPromise,
                coveredStoriesPromise,
                totalTestsPromise,
                assignedTestsPromise,
                executedTestsPromise
            ]);

            const total_stories = parseInt(results[0][0].total_stories);
            const covered_stories = parseInt(results[1][0].covered_stories);
            const total_tests = parseInt(results[2][0].total_tests);
            const assigned_tests = parseInt(results[3][0].assigned_tests);
            const executed_tests = parseInt(results[4][0].executed_tests);
            const stats = {
                total_stories,
                covered_stories,
                uncovered_stories: total_stories - covered_stories,
                total_tests,
                assigned_tests,
                unassigned_tests: total_tests - assigned_tests,
                executed_tests,
                non_executed_tests: total_tests - executed_tests,
                requirement_coverage: (covered_stories / total_stories * 100).toFixed(1),
                design_coverage: (assigned_tests / total_tests * 100).toFixed(1),
                execution_coverage: (executed_tests / total_tests * 100).toFixed(1)
            };

            console.log('generating pdf...');
            const data = {
                reportDate,
                testPlan,
                userStories,
                testCases,
                defects,
                stats
            };
            const pdf = generatePDF('report', data);
            console.log("pdf generated sucessfully");
            return pdf;
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }
}