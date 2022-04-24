import { container, singleton } from "tsyringe";
import { ProvaConstants } from "../common/constants";
import { DatabaseManager } from "../database/DatabaseManager";
import { TestExecution } from "../models/TestExecution.entity";
import { TestCaseRepository } from "../repositories/TestCaseRepository";
import { TestExecutionRepository } from "../repositories/TestExecutionRepository";
import { TestExecutionStepRepository } from "../repositories/TestExecutionStepRepository";
import { TestStateRepository } from "../repositories/TestStateRepository";
import { TestSuiteRepository } from "../repositories/TestSuiteRepository";
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

@singleton()
export class UserStoryService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getPaged(page: number, pageSize: number, sortOrder: string = ProvaConstants.SORT_ORDER_DESC, projectId: number = null): Promise<[UserStory[], number]> {
        try {
            const conn = await this._database.getConnection();
            const skip = (page - 1) * pageSize;
            const userStoryRepo = conn.getCustomRepository(UserStoryRepository);
            const qb = userStoryRepo.createQueryBuilder("us")
                .innerJoinAndSelect('us.project', 'p')
                .where(`us.deleted_at is null`);

            if (projectId) {
                qb.andWhere(`us.project_id = ${projectId}`);
            }
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
                    "userStoryCriterias"
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
                const project = await projectRepo.findOne(dto.projectId);
                if (!project) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'User Stories', dto.projectId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                entity.project = project;

                const entityCriterias = await Promise.all(dto.userStoryCriterias.map(
                    async (uc) => {
                        let criteria = new UserStoryCriteria();
                        criteria.description = uc.description;
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

    async update(id: number, dto: UserStoryUpdateDTO): Promise<UserStory> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const userStoryRepo = transactionalEntityManager.getCustomRepository(UserStoryRepository);
                const userStoryCriteriaRepo = transactionalEntityManager.getRepository(UserStoryCriteria);
                const entity = await userStoryRepo.findOne({ id }, {
                    relations: [
                        "userStoryCriterias"
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
                const removedDetails = entity.userStoryCriterias.filter(det => !dto.userStoryCriterias.some(d => d.id === det.id));
                await userStoryCriteriaRepo.remove(removedDetails);
                entity.userStoryCriterias = dto.userStoryCriterias.map(
                    (cri) => {

                        let item = entity.userStoryCriterias.find(x => x.id === cri.id);
                        if (item){
                            item.description = cri.description;
                        }else{
                           item = new UserStoryCriteria();
                           item.description = cri.description; 
                        }
                        return item;
                    }
                )
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