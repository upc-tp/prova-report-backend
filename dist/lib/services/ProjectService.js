"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const class_transformer_1 = require("class-transformer");
const tsyringe_1 = require("tsyringe");
const business_error_1 = require("../common/business-error");
const constants_1 = require("../common/constants");
const StringUtils_1 = require("../common/StringUtils");
const DatabaseManager_1 = require("../database/DatabaseManager");
const Project_entity_1 = require("../models/Project.entity");
const ProjectRepository_1 = require("../repositories/ProjectRepository");
let ProjectService = class ProjectService {
    constructor() {
        this._database = tsyringe_1.container.resolve(DatabaseManager_1.DatabaseManager);
    }
    getPaged(page, pageSize, sortOrder = constants_1.ProvaConstants.SORT_ORDER_DESC, search) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield this._database.getConnection();
                const skip = (page - 1) * pageSize;
                const projectRepo = conn.getCustomRepository(ProjectRepository_1.ProjectRepository);
                const qb = projectRepo.createQueryBuilder("p")
                    .where(`p.deleted_at is null`);
                if (search) {
                    qb.andWhere(`concat(p.title,p.description) like '%${search}%'`);
                }
                qb.orderBy({
                    "p.id": sortOrder
                });
                if (page && pageSize) {
                    qb.skip(skip);
                    qb.take(pageSize);
                }
                const result = yield qb.getManyAndCount();
                return result;
            }
            catch (error) {
                console.error(error);
                return Promise.reject(error);
            }
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield this._database.getConnection();
                const projectRepo = conn.getCustomRepository(ProjectRepository_1.ProjectRepository);
                const project = yield projectRepo.findOne({ id }, {
                    where: {
                        deletedAt: null,
                    },
                    withDeleted: true
                });
                return project;
            }
            catch (error) {
                console.error(error);
                return Promise.reject(error);
            }
        });
    }
    save(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield this._database.getConnection();
                const entity = (0, class_transformer_1.plainToClass)(Project_entity_1.Project, dto);
                return yield conn.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                    const projectRepo = transactionalEntityManager.getCustomRepository(ProjectRepository_1.ProjectRepository);
                    console.log("Creating test project:");
                    console.log(entity);
                    const project = projectRepo.save(entity);
                    console.log("Project saved successfully");
                    return project;
                })).catch(error => {
                    return Promise.reject(error);
                });
            }
            catch (error) {
                console.error(error);
                return Promise.reject(error);
            }
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = yield this._database.getConnection();
                return yield conn.transaction((transactionalEntityManager) => __awaiter(this, void 0, void 0, function* () {
                    const projectRepo = transactionalEntityManager.getCustomRepository(ProjectRepository_1.ProjectRepository);
                    const entity = yield projectRepo.findOne(id);
                    if (!entity) {
                        const notFoundError = new business_error_1.BusinessError(StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Projects', id.toString()), 404);
                        return Promise.reject(notFoundError);
                    }
                    console.log("Updating test project:");
                    entity.title = dto.title;
                    entity.description = dto.description;
                    console.log(entity);
                    const project = yield projectRepo.save(entity);
                    console.log("Project updated successfully");
                    return project;
                })).catch(error => {
                    return Promise.reject(error);
                });
            }
            catch (error) {
                console.error(error);
                return Promise.reject(error);
            }
        });
    }
};
ProjectService = __decorate([
    (0, tsyringe_1.singleton)()
], ProjectService);
exports.ProjectService = ProjectService;
//# sourceMappingURL=ProjectService.js.map