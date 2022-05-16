import { container, singleton } from "tsyringe";
import { ProvaConstants } from "../common/constants";
import { DatabaseManager } from "../database/DatabaseManager";
import { ProjectRepository } from "../repositories/ProjectRepository";

import { StringUtils } from "../common/StringUtils";
import { BusinessError } from "../common/business-error";
import { UserStory } from "../models/UserStory.entity";
import { UserStoryRepository } from "../repositories/UserStoryRepository";
import { UserStorySaveDTO } from "../dtos/user-story/UserStorySaveDTO";
import { plainToClass } from "class-transformer";
import { UserStoryCriteria } from "../models/UserStoryCriteria.entity";
import { UserStoryUpdateDTO } from "../dtos/user-story/UserStoryUpdateDTO";
import { UserStoryCriteriaRepository } from "../repositories/UserStoryCriteriaRepository";
import { UserStoryCriteriaUpdateDTO } from "../dtos/user-story/UserStoryCriteriaUpdateDTO";
import { TestCaseRepository } from "../repositories/TestCaseRepository";
import { UserClaims } from "../interfaces/UserClaims";
import { In } from "typeorm";
import { TestPlanRepository } from "../repositories/TestPlanRepository";
import { TestPlan } from "../models/TestPlan.entity";
import { Project } from "../models/Project.entity";

@singleton()
export class UserStoryService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getPaged(page: number, pageSize: number, sortOrder: string = ProvaConstants.SORT_ORDER_DESC,  search: string, projectId: number = null, testPlanId: number = null): Promise<[UserStory[], number]> {
        try {
            const conn = await this._database.getConnection();
            const skip = (page - 1) * pageSize;
            const userStoryRepo = conn.getCustomRepository(UserStoryRepository);
            const qb = userStoryRepo.createQueryBuilder("us")
                .innerJoinAndSelect('us.project', 'p')
                .leftJoinAndSelect('us.testPlan', 'tp')
                .leftJoin("users_projects", "up", "up.project_id = p.id")
                .where(`us.deleted_at is null`);

            const userClaims = container.resolve(UserClaims);
            if (userClaims.payload.uid) {
                qb.andWhere(`up.user_id = ${userClaims.payload.uid}`);
            }
            if (projectId) {
                qb.andWhere(`us.project_id = ${projectId}`);
            }
            if (testPlanId){
                qb.andWhere(`tp.id = ${testPlanId}`)
            }
            if (search) {
                qb.andWhere(`concat(us.name, us.description) like '%${search}%'`);
            }
            qb.orderBy({
                "us.id": sortOrder as any
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
            const userStoryRepo = conn.getCustomRepository(UserStoryRepository);
            const execution = await userStoryRepo.findOne({ id }, {
                where: {
                    deletedAt: null,
                },
                relations: [
                    "project",
                    "testPlan",
                    "userStoryCriterias",
                    "userStoryCriterias.testCase"
                ],
                withDeleted: true
            });
            return execution;
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async save(dto: UserStorySaveDTO): Promise<UserStory> {
        try {
            const conn = await this._database.getConnection();
            const entity = plainToClass(UserStory, dto);

            return await conn.transaction(async transactionalEntityManager => {
                const userStoryRepo = transactionalEntityManager.getCustomRepository(UserStoryRepository);
                const projectRepo = transactionalEntityManager.getCustomRepository(ProjectRepository);
                const testCaseRepo = transactionalEntityManager.getCustomRepository(TestCaseRepository);
                const testPlanRepo = transactionalEntityManager.getCustomRepository(TestPlanRepository);
                const project = await projectRepo.findOne(dto.projectId);
                if (!project) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'User Stories', dto.projectId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                entity.project = project;
                if (dto.testPlanId > 0) {
                    const testPlan = await testPlanRepo.findOne(dto.testPlanId);
                    if (!testPlan) {
                        const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Plan', dto.testPlanId.toString()), 404);
                        return Promise.reject(notFoundError);
                    }
                    entity.testPlan = testPlan;
                } else {
                    entity.testPlan = null;
                }
                const entityCriterias = await Promise.all(dto.userStoryCriterias.map(
                    async (uc) => {
                        let criteria = new UserStoryCriteria();
                        criteria.description = uc.description;
                        if (uc.testCaseId) {
                            const testCase = await testCaseRepo.findOne(uc.testCaseId);
                            if (!testCase) {
                                const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Cases', uc.testCaseId.toString()), 404);
                                return Promise.reject(notFoundError);
                            }
                            criteria.testCase = testCase;
                        }
                        return criteria;
                    }
                ));

                entity.userStoryCriterias = entityCriterias;

                console.log('Saving user story: ', entity, '...');
                const userStory = await userStoryRepo.save(entity);
                console.log('Saved successfully');
                return userStory;
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
                const userStoryRepo = transactionalEntityManager.getCustomRepository(UserStoryRepository);
                const testCaseRepo = transactionalEntityManager.getCustomRepository(TestCaseRepository);
                const userCriteriasRepo = transactionalEntityManager.getRepository(UserStoryCriteria);
                const testPlanRepo = transactionalEntityManager.getRepository(TestPlan);

                if (isNaN(projectId)) {
                    throw new BusinessError('Debe indicar el ?projectId como query parameter', 400);
                }

                //Leer datos de CSV
                const lines = csv.split(/\r\n|\n/);
                console.log("Leyendo CSV: ");
                console.log(lines);
                let data = [];

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    const entries = StringUtils.csvRowToArray(line, ',', '"');
                    const type = entries[0];
                    const name = entries[1].replace('"', ''); // Si tiene el text qualifier "" lo elimina
                    const description = entries[2].replace('"', '');
                    const testPlanTag = entries[4];
                    if (type === 'US') {
                        // Guardar suite de prueba
                        data.push({
                            type,
                            name,
                            description,
                            testPlanTag,
                            criterias: []
                        });
                    } else {
                        // Guardar caso de prueba en el ultimo suite registrado
                        const lastUserStory = data[data.length - 1];
                        const testCaseTag = entries[3];
                        lastUserStory.criterias.push({
                            type,
                            description,
                            testCaseTag
                        });
                    }
                }

                const project = await projectRepo.findOne(projectId);
                if (!project) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Projects', projectId.toString()), 404);
                    return Promise.reject(notFoundError);
                }

                let newStoryIds: number[] = [];

                for (const story of data) {
                    const testPlan = await testPlanRepo.findOne({
                        where: {
                            tag: story.testPlanTag,
                            project: {
                                id: project.id
                            }
                        }
                    });
                    if (!testPlan && story.testPlanTag) {
                        const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Plan de pruebas', story.testPlanTag), 404);
                        return Promise.reject(notFoundError);
                    }
                    let newStory = new UserStory();
                    newStory.name = story.name;
                    newStory.description = story.description;
                    newStory.project = project;
                    newStory.testPlan = testPlan;
                    newStory = await userStoryRepo.save(newStory);
                    if (story.criterias.length > 0) {
                        for (const cri of story.criterias) {
                            const testCase = await testCaseRepo.findOne({
                                where: {
                                    tag: cri.testCaseTag,
                                    testSuite: {
                                        project: {
                                            id: project.id
                                        }
                                    }
                                },
                                relations: [
                                    "testSuite",
                                    "testSuite.project"
                                ]
                            });
                            if (!testCase && cri.testCaseTag) {
                                const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Caso de prueba', cri.testCaseTag), 404);
                                return Promise.reject(notFoundError);
                            }
                            let newCriteria = new UserStoryCriteria();
                            newCriteria.description = cri.description;
                            newCriteria.testCase = testCase;
                            newCriteria.userStory = newStory;
                            await userCriteriasRepo.save(newCriteria);
                        }
                    }
                    newStoryIds.push(newStory.id);
                }
                const entities = await userStoryRepo.find({
                    where: {
                        id: In(newStoryIds)
                    },
                    relations: [
                        "testPlan",
                        "userStoryCriterias",
                        "userStoryCriterias.testCase"
                    ]
                })
                return entities;
            }).catch(error => {
                console.error(error);
                const friendlyError = new BusinessError("Hubo un error en la carga del archivo, por favor verifique el formato del .csv", 400);
                return Promise.reject(friendlyError);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async update(id: number, dto: UserStoryUpdateDTO): Promise<UserStory> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const userStoryRepo = transactionalEntityManager.getCustomRepository(UserStoryRepository);
                const userStoryCriteriaRepo = transactionalEntityManager.getRepository(UserStoryCriteria);
                const projectRepo = transactionalEntityManager.getRepository(Project);
                const testCaseRepo = transactionalEntityManager.getCustomRepository(TestCaseRepository);
                const testPlanRepo = transactionalEntityManager.getCustomRepository(TestPlanRepository);
                const entity = await userStoryRepo.findOne({ id }, {
                    relations: [
                        "userStoryCriterias",
                        "userStoryCriterias.testCase"
                    ]
                });
                if (!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'User Stories', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                console.log("Updating user story:");
                console.log(entity);
                entity.name = dto.name;
                entity.description = dto.description;

                if (dto.testPlanId > 0) {
                    const testPlan = await testPlanRepo.findOne(dto.testPlanId);
                    if (!testPlan) {
                        const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Plan', dto.testPlanId.toString()), 404);
                        return Promise.reject(notFoundError);
                    }
                    entity.testPlan = testPlan;
                } else {
                    entity.testPlan = null;
                }

                const project = await projectRepo.findOne(dto.projectId);
                if (!project) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Project', dto.projectId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                entity.project = project;

                const removedDetails = entity.userStoryCriterias.filter(det => !dto.userStoryCriterias.some(d => d.id === det.id));
                await userStoryCriteriaRepo.remove(removedDetails);
                entity.userStoryCriterias = await Promise.all(dto.userStoryCriterias.map(
                    async (uc) => {
                        let criteria = entity.userStoryCriterias.find(x => x.id === uc.id);
                        if (criteria) {
                            criteria.description = uc.description;
                        } else {
                            criteria = new UserStoryCriteria();
                            criteria.description = uc.description;
                        }
                        if (uc.testCaseId) {
                            const testCase = await testCaseRepo.findOne(uc.testCaseId);
                            if (!testCase) {
                                const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Cases', uc.testCaseId.toString()), 404);
                                return Promise.reject(notFoundError);
                            }
                            criteria.testCase = testCase;
                        }
                        return criteria;
                    }
                ));
                console.log(entity);
                const userStory = await userStoryRepo.save(entity);
                console.log("User Story updated successfully");
                return userStory;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async updateCriteria(id: number, dto: UserStoryCriteriaUpdateDTO): Promise<UserStoryCriteria> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const userStoryCriteriaRepo = transactionalEntityManager.getCustomRepository(UserStoryCriteriaRepository);
                const entity = await userStoryCriteriaRepo.findOne(id);
                if (!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'User Story Criterias', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                console.log("Updating user story:");
                entity.description = dto.description;
                console.log(entity);
                const userStoryCriteria = await userStoryCriteriaRepo.save(entity);
                console.log("Test Suite updated successfully");
                return userStoryCriteria;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

}