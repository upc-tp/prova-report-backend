import bcrypt = require("bcrypt");
import { plainToClass } from "class-transformer";
import { container, singleton } from "tsyringe";
import { BusinessError } from "../common/business-error";
import { ProvaConstants } from "../common/constants";
import { StringUtils } from "../common/StringUtils";
import { DatabaseManager } from "../database/DatabaseManager";
import { CollaboratorDTO } from "../dtos/CollaboratorDTO";
import { ProjectSaveDTO } from "../dtos/ProjectSaveDTO";
import { RegisterDTO } from "../dtos/RegisterDTO";
import { UserClaims } from "../interfaces/UserClaims";
import { Project } from "../models/Project.entity";
import { User } from "../models/User.entity";
import { UserProject } from "../models/UserProject.entity";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { UserProjectRepository } from "../repositories/UserProjectRepository";
import { UserRepository } from "../repositories/UserRepository";
import { transporter } from "../common/mailer";
import { VersionsRepository } from "../repositories/VersionsRepository";
import { Version } from "../models/Version.entity";

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
            const userClaims = container.resolve(UserClaims);
            const qb = projectRepo.createQueryBuilder("p")
                .leftJoin("users_projects", "up", "up.project_id = p.id")
                .where(`p.deleted_at is null`);
            if (search) {
                qb.andWhere(`concat(p.title,p.description) like '%${search}%'`);
            }
            if (userClaims.payload.uid) {
                qb.andWhere(`up.user_id = ${userClaims.payload.uid}`);
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

    async getCollaborators(page: number, pageSize: number, sortOrder: string = ProvaConstants.SORT_ORDER_DESC, search: string, projectId: number = null): Promise<[CollaboratorDTO[], number]> {
        try {
            const conn = await this._database.getConnection();
            const skip = (page - 1) * pageSize;
            const userRepo = conn.getCustomRepository(UserRepository);
            const qb = userRepo.createQueryBuilder("u")
                .innerJoin("users_projects", "up", "up.user_id = u.id")
                .where(`u.deleted_at is null`);
            if (search) {
                qb.andWhere(`concat(u.first_name,u.last_name,u.email) like '%${search}%'`);
            }
            if (projectId) {
                qb.andWhere(`up.project_id = ${projectId}`);
            }

            qb.orderBy({
                "u.id": sortOrder as any
            });
            if (page && pageSize) {
                qb.skip(skip);
                qb.take(pageSize);
            }
            const [users, count] = await qb.getManyAndCount();
            const collaborators = users.map(u => {
                const collaborator: CollaboratorDTO = {
                    uid: u.id,
                    role: u.role,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email
                };
                return collaborator;
            });
            return [collaborators, count];
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async getNoCollaborators(page: number, pageSize: number, sortOrder: string = ProvaConstants.SORT_ORDER_DESC, search: string, projectId: number = null): Promise<[CollaboratorDTO[], number]> {
        try {
            const conn = await this._database.getConnection();
            const skip = (page - 1) * pageSize;
            const userRepo = conn.getCustomRepository(UserRepository);
            const userClaims = container.resolve(UserClaims);
            const qb = userRepo.createQueryBuilder("u")
                .innerJoin("users_projects", "up", "up.user_id = u.id")
                .where(`u.deleted_at is null`);
            if (search) {
                qb.andWhere(`concat(u.first_name,u.last_name,u.email) like '%${search}%'`);
            }
            if (projectId) {
                qb.andWhere(`up.project_id != ${projectId}`);
            }

            if (userClaims.payload.uid) {
                qb.andWhere(`up.created_by = "${userClaims.payload.email}"`);
            }

            qb.orderBy({
                "u.id": sortOrder as any
            });
            if (page && pageSize) {
                qb.skip(skip);
                qb.take(pageSize);
            }
            const [users, count] = await qb.getManyAndCount();
            const noCollaborators = users.map(u => {
                const collaborator: CollaboratorDTO = {
                    uid: u.id,
                    role: u.role,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email
                };
                return collaborator;
            });

            const [collaborators, count2] = await this.getCollaborators(page, pageSize, sortOrder, search, projectId);
            const resultCollaborators = noCollaborators.filter(x => { return !collaborators.some(x2 => { return x.uid === x2.uid }) });

            return [resultCollaborators, count];
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async assignCollaborator(projectId: number, userId: number): Promise<CollaboratorDTO> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const userRepo = transactionalEntityManager.getCustomRepository(UserRepository);
                const projectRepo = transactionalEntityManager.getCustomRepository(ProjectRepository);
                const userProjectRepo = transactionalEntityManager.getCustomRepository(UserProjectRepository);
                const entity = await userRepo.findOne(userId);
                if (!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Users', userId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                const project = await projectRepo.findOne(projectId);
                if (!project) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Proyecto', projectId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                const userProject = new UserProject();
                userProject.accessType = 'Collaborator';
                userProject.project = project;
                userProject.user = entity;
                await userProjectRepo.save(userProject);

                const collaborator: CollaboratorDTO = {
                    uid: entity.id,
                    firstName: entity.firstName,
                    lastName: entity.lastName,
                    email: entity.email,
                    role: entity.role
                };
                try {
                    await transporter.sendMail({
                        from: '"Prova Report" <' + process.env.SMTP_FROM_EMAIL + '>',
                        to: entity.email,
                        subject: "Te han incluido en un nuevo proyecto!",
                        html: `
                        <h1 style="color: #2e6c80;">Hola ${entity.firstName}, ahora eres colaborador de ${project.title}</h1>
                            <h3 style="color: #2e6c80;">Puedes acceder al proyecto desde este link: <a href="${'http://' + process.env.CLIENT_URL + '/detalle-proyectos?projectId=' + project.id}">Proyecto</a></h3>
                        `,
                    });
                } catch (error) {
                    console.error(error);
                }
                return collaborator;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }


    async getById(id: number): Promise<Project> {
        try {
            const conn = await this._database.getConnection();
            const projectRepo = conn.getCustomRepository(ProjectRepository);
            const project = await projectRepo.findOne({ id }, {
                where: {
                    deletedAt: null,
                }
            });
            return project;
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
                const userProjectRepo = transactionalEntityManager.getCustomRepository(UserProjectRepository);
                const userRepo = transactionalEntityManager.getCustomRepository(UserRepository);
                const versionRepo = transactionalEntityManager.getCustomRepository(VersionsRepository);

                const userClaims = container.resolve(UserClaims);
                const user = await userRepo.findOne(userClaims.payload.uid);
                if (!user) {
                    throw new BusinessError('Lo sentimos, su sesión ha expirado. Vuelva a ingresar.', 403);
                }

                const alreadyExists = await projectRepo.createQueryBuilder("p")
                    .innerJoin("p.userProjects", "up")
                    .where("p.title = :title and up.user_id = :userId", { title: entity.title, userId: user.id })
                    .getCount() > 0;

                if (alreadyExists) {
                    throw new BusinessError(`El proyecto con título "${entity.title}" ya se encuentra registrado`, 400);
                }

                console.log("Creating test project:");
                console.log(entity);
                entity.lastVersion = 1;
                const project = await projectRepo.save(entity);
                console.log("Project saved successfully");
                console.log("Assigning user to project");

                const userProject = new UserProject();
                userProject.accessType = 'Owner';
                userProject.user = user;
                userProject.project = project;
                await userProjectRepo.save(userProject);
                console.log("User assigned to project successfully");

                console.log("Creating version: ");
                const newVersion = new Version();
                newVersion.title = "1.0";
                newVersion.description = dto.description;
                newVersion.order = 1;
                newVersion.project = project;
                await versionRepo.save(newVersion);
                console.log("Version saved successfully");
                return project;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async addCollaborator(projectId: number, dto: RegisterDTO): Promise<CollaboratorDTO> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const userRepo = transactionalEntityManager.getCustomRepository(UserRepository);
                const projectRepo = transactionalEntityManager.getCustomRepository(ProjectRepository);
                const userProjectRepo = transactionalEntityManager.getCustomRepository(UserProjectRepository);
                const countEmail = await userRepo.count({
                    where: {
                        email: dto.email
                    }
                });
                if (countEmail > 0) {
                    throw new BusinessError("El correo electrónico ya se encuentra registrado.", 400);
                }
                const user = plainToClass(User, dto);
                user.role = dto.role;
                const saltRounds = +process.env.ACCESS_SALT_ROUNDS;
                const encrypted = await bcrypt.hash(dto.password, saltRounds);
                user.password = encrypted;
                const entity = await userRepo.save(user);
                const project = await projectRepo.findOne(projectId);
                if (!project) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Proyecto', projectId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                const userProject = new UserProject();
                userProject.accessType = 'Collaborator';
                userProject.project = project;
                userProject.user = entity;
                await userProjectRepo.save(userProject);

                const collaborator: CollaboratorDTO = {
                    uid: entity.id,
                    firstName: entity.firstName,
                    lastName: entity.lastName,
                    email: entity.email,
                    role: entity.role
                };
                try {
                    await transporter.sendMail({
                        from: '"Prova Report" <' + process.env.SMTP_FROM_EMAIL + '>',
                        to: entity.email,
                        subject: "Te han incluido en un nuevo proyecto!",
                        html: `
                        <h1 style="color: #2e6c80;">Hola ${entity.firstName}, ahora eres colaborador de ${project.title}</h1>
                            <h3 style="color: #2e6c80;">Puedes acceder al proyecto desde este link: <a href="${'http://' + process.env.CLIENT_URL + '/detalle-proyectos?projectId=' + project.id}">Proyecto</a></h3>
                        `,
                    });
                } catch (error) {
                    console.error(error);
                }
                return collaborator;
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
                const userRepo = transactionalEntityManager.getCustomRepository(UserRepository);
                const entity = await projectRepo.findOne(id);
                if (!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Proyecto', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                const userClaims = container.resolve(UserClaims);
                const user = await userRepo.findOne(userClaims.payload.uid);
                if (!user) {
                    throw new BusinessError('Lo sentimos, su sesión ha expirado. Vuelva a ingresar.', 403);
                }
                if (entity.title !== dto.title) {
                    const alreadyExists = await projectRepo.createQueryBuilder("p")
                        .innerJoin("p.userProjects", "up")
                        .where("p.title = :title and up.user_id = :userId", { title: dto.title, userId: user.id })
                        .getCount() > 0;
                    if (alreadyExists) {
                        throw new BusinessError(`El proyecto con título "${dto.title}" ya se encuentra registrado`, 400);
                    }
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

    async delete(id: number): Promise<any> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const projectRepo = transactionalEntityManager.getCustomRepository(ProjectRepository);
                const entity = await projectRepo.findOne(id, {
                    relations: [
                        "testPlans",
                        "testSuites",
                        "userStories"
                    ]
                });
                if (!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Proyecto', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                const result = await projectRepo.softRemove(entity);
                return result;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        } 
    }

    async deleteCollaborator(id: number, userId: number): Promise<any> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const userProjectRepo = transactionalEntityManager.getCustomRepository(UserProjectRepository);
                const entity = await userProjectRepo.findOne({
                    where: {
                        user: {
                            id: userId
                        },
                        project: {
                            id
                        }
                    }
                });
                if (!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Colaborador de proyecto', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                const result = await userProjectRepo.remove(entity);
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