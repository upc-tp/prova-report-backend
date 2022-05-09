import { plainToClass } from "class-transformer";
import { container, singleton } from "tsyringe";
import { BusinessError } from "../common/business-error";
import { ProvaConstants } from "../common/constants";
import { StringUtils } from "../common/StringUtils";
import { DatabaseManager } from "../database/DatabaseManager";
import { DefectBulkUpdateDTO } from "../dtos/defect/DefectBulkUpdateDTO";
import { DefectSaveDTO } from "../dtos/defect/DefectSaveDTO";
import { DefectUpdateDTO } from "../dtos/defect/DefectUpdateDTO";
import { Defect } from "../models/Defects.entity";
import { generatePDF } from "../reports/Pdf";
import { DefectRepository } from "../repositories/DefectRepository";
import { DefectStateRepository } from "../repositories/DefectStateRepository";
import { PriorityRepository } from "../repositories/PriorityRepository";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { SeverityRepository } from "../repositories/SeverityRepository";
import { TestCaseRepository } from "../repositories/TestCaseRepository";
import { TestExecutionRepository } from "../repositories/TestExecutionRepository";
import { TestSuiteRepository } from "../repositories/TestSuiteRepository";

@singleton()
export class DefectService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getPage(page: number, pageSize: number, sortOrder: string = ProvaConstants.SORT_ORDER_DESC, search: string, projectId: number = null, 
        defectStateId: number = null, is_fixed: number = null): Promise<[Defect[], number]> {
        try {
            const conn = await this._database.getConnection();
            const skip = (page - 1) * pageSize;
            const defectRepo = conn.getCustomRepository(DefectRepository);
            const qb = defectRepo.createQueryBuilder("d")
                .innerJoinAndSelect('d.defectState', 'ds')
                .innerJoinAndSelect('d.testCase', 'tc')
                .innerJoinAndSelect('tc.testSuite', 'ts')
                .innerJoinAndSelect('d.testExecution', 'te')
                .leftJoinAndSelect('d.priority', 'p')
                .leftJoinAndSelect('d.severity', 's')
                .where('d.deleted_at is null');
            if (search) {
                qb.andWhere(`concat(d.title,d.repro_steps) like '%${search}%'`);
            }

            if (projectId) {
                qb.andWhere(`ts.project_id = ${projectId}`);
            }

            if (defectStateId) {
                qb.andWhere(`ds.id = ${defectStateId}`);
            }

            if (is_fixed === 0 || is_fixed === 1) {
                qb.andWhere(`d.is_fixed = ${is_fixed}`);
            }

            qb.orderBy({
                "d.id": sortOrder as any
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

    async getById(id: number): Promise<any> {
        try {
            const conn = await this._database.getConnection();
            const defectRepo = conn.getCustomRepository(DefectRepository);
            const defect = await defectRepo.findOne({ id }, {
                where: {
                    deletedAt: null,
                },
                relations: [
                    "defectState",
                    "priority",
                    "severity",
                    "testCase",
                    "testExecution"
                ],
                withDeleted: true
            });
            return defect;
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async save(dto: DefectSaveDTO): Promise<Defect> {
        try {
            const conn = await this._database.getConnection();
            const entity = plainToClass(Defect, dto);
            return await conn.transaction(async transactionalEntityManager => {
                const defectRepo = transactionalEntityManager.getCustomRepository(DefectRepository);
                const defectStateRepo = transactionalEntityManager.getCustomRepository(DefectStateRepository);
                const priorityRepo = transactionalEntityManager.getCustomRepository(PriorityRepository);
                const severityRepo = transactionalEntityManager.getCustomRepository(SeverityRepository);
                const testCaseRepo = transactionalEntityManager.getCustomRepository(TestCaseRepository);
                const testExecutionRepo = transactionalEntityManager.getCustomRepository(TestExecutionRepository);
                
                const testCase = await testCaseRepo.findOne(dto.testCaseId);
                if(!testCase) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Cases', dto.testCaseId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                const testExecution = await testExecutionRepo.findOne(dto.testExecutionId);
                if(!testExecution) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Executions', dto.testExecutionId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                entity.testExecution = testExecution;
                const stateId = ProvaConstants.TEST_STATE_NOT_EXECUTED;
                const state = await defectStateRepo.findOne(stateId);
                if(!state) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Defect States', dto.defectStateId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                const priority = await priorityRepo.findOne(dto.priorityId);
                if (!priority) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Priority', dto.priorityId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                const severity = await severityRepo.findOne(dto.severityId);
                if (!severity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Severity', dto.severityId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                entity.priority = priority;
                entity.severity = severity;
                entity.testCase = testCase;
                entity.defectState = state;
                console.log("Creating Defect: ");
                console.log(entity);
                const defect = await defectRepo.save(entity);
                console.log("Defect save");
                return defect;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async update(id: number, dto: DefectUpdateDTO): Promise<any> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const defectRepo = transactionalEntityManager.getCustomRepository(DefectRepository);
                const entity = await defectRepo.findOne(id);
                const severityRepo = transactionalEntityManager.getCustomRepository(SeverityRepository);
                const priorityRepo = transactionalEntityManager.getCustomRepository(PriorityRepository);
                const defectStateRepo = transactionalEntityManager.getCustomRepository(DefectStateRepository);

                if(!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Defects', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }

                const priority = await priorityRepo.findOne(dto.priorityId);
                if (!priority) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Priority', dto.priorityId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                const severity = await severityRepo.findOne(dto.severityId);
                if (!severity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Severity', dto.severityId.toString()), 404);
                    return Promise.reject(notFoundError);
                }

                const defectState = await defectStateRepo.findOne(dto.defectStateId);
                if (!defectState) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Defect State', dto.defectStateId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                console.log("Update Defect");
                entity.title = dto.title;
                entity.repro_steps = dto.repro_steps;
                entity.priority = priority;
                entity.severity = severity;
                entity.defectState = defectState;
                console.log(entity);
                const defect = await defectRepo.save(entity);
                console.log("Defect updated");
                return defect;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async bulkUpdate(dto: DefectBulkUpdateDTO): Promise<any> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const defectRepo = transactionalEntityManager.getCustomRepository(DefectRepository);
                const defectStateRepo = transactionalEntityManager.getCustomRepository(DefectStateRepository);

                const defectState = await defectStateRepo.findOne(dto.defectStateId);
                if (!defectState) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Defect State', dto.defectStateId.toString()), 404);
                    return Promise.reject(notFoundError);
                }

                console.log("Bulk Update Defects");
                let entities = await defectRepo.findByIds(dto.defectIds, {
                    relations: [
                        "defectState",
                        "priority",
                        "severity",
                        "testCase",
                        "testExecution"
                    ]
                });
                entities = entities.map(e => {
                    e.is_fixed = dto.is_fixed;
                    e.defectState = defectState;
                    return e;
                });
                const result = await defectRepo.save(entities);
                console.log("Defects updated");
                return result;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async getPdf(projectId: number, testSuiteId: number, reportDate: string): Promise<Defect[]> {
        try {
            const conn = await this._database.getConnection();
            const defectRepo = conn.getCustomRepository(DefectRepository);
            const projectRepo = conn.getCustomRepository(ProjectRepository);
            const suiteRepo = conn.getCustomRepository(TestSuiteRepository);
            const qb = defectRepo.createQueryBuilder("d")
                .innerJoinAndSelect('d.defectState', 'ds')
                .innerJoinAndSelect('d.testCase', 'tc')
                .innerJoinAndSelect('tc.testSuite', 'ts')
                .innerJoinAndSelect('d.testExecution', 'te')
                .leftJoinAndSelect('d.priority', 'p')
                .leftJoinAndSelect('d.severity', 's')
                .where('d.deleted_at is null');
            
            const project = await projectRepo.findOne(projectId);
            if (!project) {
                const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Project', projectId.toString()), 404);
                return Promise.reject(notFoundError);
            }

            const suite = await projectRepo.findOne(testSuiteId);
            if (!suite) {
                const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Project', testSuiteId.toString()), 404);
                return Promise.reject(notFoundError);
            }

            if (projectId) {
                qb.andWhere(`ts.project_id = ${projectId}`);
            }

            if (projectId) {
                qb.andWhere(`ts.id = ${testSuiteId}`);
            }

            const defects = await qb.getMany();
            console.log('generating pdf...');
            const data = {
                reportDate,
                project,
                suite,
                defects
            }
            console.log('La data es: ', data);
            const pdf = generatePDF('reportDefects', data);
            console.log("pdf generated sucessfully");
            return pdf;
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }
}