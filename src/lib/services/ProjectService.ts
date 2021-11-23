import { container, singleton } from "tsyringe";
import { ProvaConstants } from "../common/constants";
import { DatabaseManager } from "../database/DatabaseManager";
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
}