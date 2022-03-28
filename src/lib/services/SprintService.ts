import {container, singleton} from "tsyringe";
import {DatabaseManager} from "../database/DatabaseManager";
import {ProvaConstants} from "../common/constants";
import {Sprint} from "../models/Sprint.entity";
import {SprintsRepository} from "../repositories/SprintsRepository";
import {UserClaims} from "../interfaces/UserClaims";
import {SprintSaveDTO} from "../dtos/sprint/SprintSaveDTO";
import {plainToClass} from "class-transformer";
import {ProjectRepository} from "../repositories/ProjectRepository";
import {BusinessError} from "../common/business-error";
import {StringUtils} from "../common/StringUtils";
import {SprintUpdateDTO} from "../dtos/sprint/SprintUpdateDTO";

@singleton()
export class SprintService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getPaged(page: number, pageSize: number, sortOrder: string = ProvaConstants.SORT_ORDER_DESC, search: string, projectId: number = null): Promise<[Sprint[], number]> {
        try {
            const conn = await this._database.getConnection();
            const skip = (page - 1) * pageSize;
            const sprintRepo = conn.getCustomRepository(SprintsRepository);
            const qb = sprintRepo.createQueryBuilder("s")
                .innerJoinAndSelect('s.project', 'p')
                .leftJoin("users_projects", "up","up.project_id = p.id")
                .where(`s.deletedAt is null`);

            const userClaims = container.resolve(UserClaims);
            if(userClaims.payload.uid){
                qb.andWhere(`up.user_id = ${userClaims.payload.uid}`);
            }
            if (search) {
                qb.andWhere(`concat(s.title,s.description) like '%${search}%'`);
            }
            if(projectId) {
                qb.andWhere(`s.project_id = ${projectId}`);
            }
            qb.orderBy({
                "s.id": sortOrder as any
            });
            if (page && pageSize) {
                qb.skip(skip);
                qb.take(pageSize);
            }
            const result = await qb.getManyAndCount();
            return  result;
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async save(dto: SprintSaveDTO): Promise<Sprint> {
        try {
            const conn = await this._database.getConnection();
            const entity = plainToClass(Sprint, dto);
            return await conn.transaction(async transactionalEntityManager => {
               const projectRepo = transactionalEntityManager.getCustomRepository(ProjectRepository);
               const sprintRepo = transactionalEntityManager.getCustomRepository(SprintsRepository);
               const project = await projectRepo.findOne(dto.projectId);
               if(!project) {
                   const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Projects', dto.projectId.toString()), 404);
                   return Promise.reject(notFoundError);
               }
               entity.project = project;
               console.log("Creating new sprint: ");
               console.log(entity);
               const sprint = sprintRepo.save(entity);
               console.log("Sprint saved successfully");
               return sprint;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async update(id: number, dto: SprintUpdateDTO): Promise<Sprint>{
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const sprintRepo = transactionalEntityManager.getCustomRepository(SprintsRepository);
                const entity = await sprintRepo.findOne(id);
                if (!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Sprints', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                console.log("Updating sprint: ");
                entity.title = dto.title;
                entity.description = dto.description;
                console.log(entity);
                const sprint = await sprintRepo.save(entity);
                console.log("Sprint Updated successfully");
                return sprint;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error){
            console.log(error);
            return Promise.reject(error);
        }
    }

    async getById(id: number): Promise<Sprint>{
        try {
            const conn = await this._database.getConnection();
            const sprintRepo = conn.getCustomRepository(SprintsRepository);
            const sprint = await sprintRepo.findOne({id},{
               where: {
                   deletedAt: null,
               },
                relations: [
                    "project"
                ],
                withDeleted: true
            });
            return sprint;
        }catch (error){
            console.log(error);
            return Promise.reject(error);
        }
    }

}
