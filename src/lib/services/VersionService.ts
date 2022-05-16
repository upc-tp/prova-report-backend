import { container, singleton } from "tsyringe";
import { DatabaseManager } from "../database/DatabaseManager";
import { ProvaConstants } from "../common/constants";
import { Version } from "../models/Version.entity";
import { VersionsRepository } from "../repositories/VersionsRepository";
import { UserClaims } from "../interfaces/UserClaims";
import { VersionSaveDTO } from "../dtos/version/VersionSaveDTO";
import { plainToClass } from "class-transformer";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { BusinessError } from "../common/business-error";
import { StringUtils } from "../common/StringUtils";
import { VersionUpdateDTO } from "../dtos/version/VersionUpdateDTO";

@singleton()
export class VersionService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getPaged(page: number, pageSize: number, sortOrder: string = ProvaConstants.SORT_ORDER_DESC, search: string, projectId: number = null): Promise<[Version[], number]> {
        try {
            const conn = await this._database.getConnection();
            const skip = (page - 1) * pageSize;
            const versionRepo = conn.getCustomRepository(VersionsRepository);
            const qb = versionRepo.createQueryBuilder("s")
                .innerJoinAndSelect('s.project', 'p')
                .leftJoin("users_projects", "up", "up.project_id = p.id")
                .where(`s.deletedAt is null`);

            const userClaims = container.resolve(UserClaims);
            if (userClaims.payload.uid) {
                qb.andWhere(`up.user_id = ${userClaims.payload.uid}`);
            }
            if (search) {
                qb.andWhere(`concat(s.title,s.description) like '%${search}%'`);
            }
            if (projectId) {
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
            return result;
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async save(dto: VersionSaveDTO): Promise<Version> {
        try {
            const conn = await this._database.getConnection();
            const entity = plainToClass(Version, dto);
            return await conn.transaction(async transactionalEntityManager => {
                const projectRepo = transactionalEntityManager.getCustomRepository(ProjectRepository);
                const versionRepo = transactionalEntityManager.getCustomRepository(VersionsRepository);
                const project = await projectRepo.findOne(dto.projectId);
                if (!project) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Projects', dto.projectId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                entity.project = project;
                const alreadyExists = await versionRepo.createQueryBuilder("v")
                    .where("v.title = :title and v.project_id = :projectId", { title: dto.title, projectId: project.id })
                    .getCount() > 0;
                if (alreadyExists) {
                    throw new BusinessError(`La versión con título "${dto.title}" ya se encuentra registrada en el proyecto`, 400);
                }
                const order = ++project.lastVersion;
                entity.order = order;
                console.log("Creating new version: ");
                console.log(entity);
                const version = await versionRepo.save(entity);
                console.log("Version saved successfully");
                console.log("Updating last version of project: ", project.title);
                await projectRepo.update(project.id, {
                    lastVersion: order
                });
                console.log("Project updated successfully");
                return version;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async update(id: number, dto: VersionUpdateDTO): Promise<Version> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const versionRepo = transactionalEntityManager.getCustomRepository(VersionsRepository);
                const entity = await versionRepo.findOne(id);
                if (!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Versions', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                console.log("Updating version: ");
                entity.description = dto.description;
                console.log(entity);
                const version = await versionRepo.save(entity);
                console.log("Version Updated successfully");
                return version;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }

    async getById(id: number): Promise<Version> {
        try {
            const conn = await this._database.getConnection();
            const versionRepo = conn.getCustomRepository(VersionsRepository);
            const version = await versionRepo.findOne({ id }, {
                where: {
                    deletedAt: null,
                },
                relations: [
                    "project"
                ]
            });
            return version;
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }

    async delete(id: number): Promise<any> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const versionRepo = transactionalEntityManager.getCustomRepository(VersionsRepository);
                const entity = await versionRepo.findOne(id);
                if (!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Version', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                const result = await versionRepo.remove(entity);
                return result;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        } 
    }

}
