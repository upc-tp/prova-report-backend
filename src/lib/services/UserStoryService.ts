import { plainToClass } from "class-transformer";
import { container, singleton } from "tsyringe";
import { DatabaseManager } from "../database/DatabaseManager";
import { UserStory } from "../models/UserStory.entity";
import { UserStoryRepository } from "../repositories/UserStoryRepository";
import { UserStorySaveDTO } from "../dtos/UserStorySaveDTO";
import { BusinessError } from "../common/business-error";
import { StringUtils } from "../common/StringUtils";
import { ProvaConstants } from "../common/constants";

@singleton()
export class UserStoryService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getAll(): Promise<[UserStory[], number]> {
        try {
            const conn = await this._database.getConnection();
            const userStoryRepo = conn.getCustomRepository(UserStoryRepository);
            const result = await userStoryRepo.findAndCount();
            return result;
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }

    async getById(id: number): Promise<UserStory> {
        try {
            const conn = await this._database.getConnection();
            const userStoryRepo = conn.getCustomRepository(UserStoryRepository);
            const userStory = await userStoryRepo.findOne({ id }, {
                where: {
                    deletedAt: null,
                },
                withDeleted: true
            });
            return userStory;
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
                console.log("Creating user story:");
                console.log(entity);
                const userStory = await userStoryRepo.save(entity);
                console.log("User Story savec succesfully");
                return userStory;
            }).catch(error => {
                return Promise.reject(error);
            });
        }   catch(error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async update(id: number, dto: UserStorySaveDTO): Promise<UserStory> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const userStoryRepo = transactionalEntityManager.getCustomRepository(UserStoryRepository);
                const entity = await userStoryRepo.findOne(id);
                if(!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'User Stories', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                console.log("Updating user story:");
                entity.title = dto.title;
                entity.description = dto.description;
                console.log(entity);
                const userStory = await userStoryRepo.save(entity);;
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
}