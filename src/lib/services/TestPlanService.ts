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
                .leftJoinAndSelect('t.version','v')
                .innerJoinAndSelect('t.project', 'p')
                .leftJoin("users_projects", "up", "up.project_id = p.id")
                .where(`t.deleted_at is null`);
                
            const userClaims = container.resolve(UserClaims);
            if(userClaims.payload.uid) {
                qb.andWhere(`up.user_id = ${userClaims.payload.uid}`);
            }
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
                ],
                withDeleted: true
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
                const testPlanRepo = transactionalEntityManager.getCustomRepository(TestPlanRepository);
                const entity = await testPlanRepo.findOne(id);
                if (!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Plan', id.toString()), 404);
                    return Promise.reject(notFoundError);
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
            const pdf = generatePDF('report', { id, reportDate });
            return pdf;
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }
}