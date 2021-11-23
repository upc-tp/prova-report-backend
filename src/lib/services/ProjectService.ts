import { plainToClass } from "class-transformer";
import { container, singleton } from "tsyringe";
import { BusinessError } from "../common/business-error";
import { ProvaConstants } from "../common/constants";
import { StringUtils } from "../common/StringUtils";
import { DatabaseManager } from "../database/DatabaseManager";
import { ProjectSaveDTO } from "../dtos/ProjectSaveDTO";
import { Project } from "../models/Project.entity";
import { ProjectRepository } from "../repositories/ProjectRepository";

@singleton()
export class ProjectService {

    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getPaged(page: number, pageSize: number, sortOrder: string = ProvaConstants.SORT_ORDER_DESC, search: string): Promise<[Project[], number]> {
        try {
            const conn = await this._database.getConnection();
            const skip = (page - 1) * pageSize;
            const projectRepo = conn.getCustomRepository(ProjectRepository);
            const qb = projectRepo.createQueryBuilder("p")
                .where(`p.deleted_at is null`);
            if (search) {
                qb.andWhere(`concat(p.title,p.description) like '%${search}%'`);
            }
            qb.orderBy({
                "p.id": sortOrder as any
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

    async save(dto: ProjectSaveDTO): Promise<Project> {
        try {
            const conn = await this._database.getConnection();
            const entity = plainToClass(Project, dto);
            return await conn.transaction(async transactionalEntityManager => {
                const projectRepo = transactionalEntityManager.getCustomRepository(ProjectRepository);
                console.log("Creating test project:");
                console.log(entity);
                const project = projectRepo.save(entity);
                console.log("Project saved successfully");
                return project;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async update(id: number, dto: ProjectSaveDTO): Promise<Project> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const projectRepo = transactionalEntityManager.getCustomRepository(ProjectRepository);
                const entity = await projectRepo.findOne(id);
                if (!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Projects', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                console.log("Updating test project:");
                entity.title = dto.title;
                entity.description = dto.description;
                console.log(entity);
                const project = await projectRepo.save(entity);
                console.log("Project updated successfully");
                return project;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }
}