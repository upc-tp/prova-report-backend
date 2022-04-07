import { classToClass, classToPlain, plainToClass, plainToClassFromExist } from "class-transformer";
import { container, singleton } from "tsyringe";
import { BusinessError } from "../common/business-error";
import { ProvaConstants } from "../common/constants";
import { StringUtils } from "../common/StringUtils";
import { DatabaseManager } from "../database/DatabaseManager";
import { CollaboratorDTO } from "../dtos/CollaboratorDTO";
import { TestCaseDTO } from "../dtos/test-case/TestCaseDTO";
import { TestCaseSaveDTO } from "../dtos/test-case/TestCaseSaveDTO";
import { TestCaseUpdateDTO } from "../dtos/test-case/TestCaseUpdateDTO";
import { TestCase } from "../models/TestCase.entity";
import { PriorityRepository } from "../repositories/PriorityRepository";
import { SeverityRepository } from "../repositories/SeverityRepository";
import { TestCaseRepository } from "../repositories/TestCaseRepository";
import { TestStateRepository } from "../repositories/TestStateRepository";
import { TestSuiteRepository } from "../repositories/TestSuiteRepository";
import {UserRepository} from "../repositories/UserRepository";
import { transporter } from "../common/mailer";

@singleton()
export class TestCaseService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getPaged(page: number, pageSize: number, sortOrder: string = ProvaConstants.SORT_ORDER_DESC, search: string, testSuiteId: number = null): Promise<[TestCase[], number]> {
        try {
            const conn = await this._database.getConnection();
            const skip = (page - 1) * pageSize;
            const testCaseRepo = conn.getCustomRepository(TestCaseRepository);
            const qb = testCaseRepo.createQueryBuilder("t")
                .innerJoinAndSelect('t.testState', 'ts')
                .innerJoinAndSelect('t.testSuite', 'tst')
                .leftJoinAndSelect('t.priority', 'p')
                .leftJoinAndSelect('t.severity', 's')
                .leftJoinAndSelect('t.userInCharge', 'u')
                .where(`t.deleted_at is null`);
            if (search) {
                qb.andWhere(`concat(t.title,t.description) like '%${search}%'`);
            }

            if (testSuiteId) {
                qb.andWhere(`t.test_suite_id = ${testSuiteId}`);
            }

            qb.orderBy({
                "t.id": sortOrder as any
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

    async getById(id: number): Promise<TestCaseDTO> {
        try {
            const conn = await this._database.getConnection();
            const testCaseRepo = conn.getCustomRepository(TestCaseRepository);
            const testCase = await testCaseRepo.findOne({ id }, {
                where: {
                    deletedAt: null,
                },
                relations: [
                    "testSuite",
                    "testState",
                    "severity",
                    "priority",
                    "userInCharge",
                ],
                withDeleted: true
            });
            let testCaseDto = plainToClass(TestCaseDTO, testCase);
            if (testCase.userInCharge) {
                testCaseDto.userInCharge = {
                    uid: testCase.userInCharge.id,
                    email: testCase.userInCharge.email,
                    firstName: testCase.userInCharge.firstName,
                    lastName: testCase.userInCharge.lastName,
                    role: testCase.userInCharge.role
                }
            }
            return testCaseDto;
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async save(dto: TestCaseSaveDTO): Promise<any> {
        try {
            const conn = await this._database.getConnection();
            const entity = plainToClass(TestCase, dto);
            return await conn.transaction(async transactionalEntityManager => {
                const testCaseRepo = transactionalEntityManager.getCustomRepository(TestCaseRepository);
                const testSuiteRepo = transactionalEntityManager.getCustomRepository(TestSuiteRepository);
                const testStateRepo = transactionalEntityManager.getCustomRepository(TestStateRepository);
                const severityRepo = transactionalEntityManager.getCustomRepository(SeverityRepository);
                const priorityRepo = transactionalEntityManager.getCustomRepository(PriorityRepository);
                const userRepo = transactionalEntityManager.getCustomRepository(UserRepository);


                const testSuite = await testSuiteRepo.findOne(dto.testSuiteId);
                if (!testSuite) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Suites', dto.testSuiteId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                entity.testSuite = testSuite;
                const stateId = ProvaConstants.TEST_STATE_NOT_EXECUTED;
                const state = await testStateRepo.findOne(stateId);
                if (!state) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test States', stateId.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                const user = await userRepo.findOne({
                    where: {
                        id: dto.userId
                    }
                });
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
                entity.testState = state;
                entity.priority = priority;
                entity.severity = severity;
                entity.userInCharge = user;
                console.log("Creating test case:");
                console.log(entity);
                const testCase = await testCaseRepo.save(entity);
                console.log("Test case saved successfully");
                const entityDto = plainToClass(TestCaseDTO, testCase);
                if (user) {
                    const userDto: CollaboratorDTO = {
                        uid: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    }
                    entityDto.userInCharge = userDto;
                    try {
                        await transporter.sendMail({
                            from: '"Prova Report" <' + process.env.SMTP_FROM_EMAIL + '>',
                            to: entityDto.userInCharge.email,
                            subject: "Se te asignó un caso de prueba",
                            html: `
                            <h1 style="color: #2e6c80;">Hola ${entityDto.userInCharge.firstName}, te han asignado un caso de prueba</h1>
                            <p>El nombre del caso de prueba es ${entityDto.title}</p>
                            <p><strong>Prioridad: </strong>${entityDto.priority.name}</p>
                            <p><strong>Severidad: </strong>${entityDto.severity.name}</p>
                            <h3 style="color: #2e6c80;">Puedes acceder al suite de pruebas desde este link: <a href="${'http://' + process.env.CLIENT_URL + '/detalle-suite-pruebas?suiteId=' + entity.testSuite.id}">TestSuite</a></h3>
                            `,
                        });
                    } catch (error) {
                        console.error(error);
                    }
                }
                return entityDto;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async update(id: number, dto: TestCaseUpdateDTO): Promise<any> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const testCaseRepo = transactionalEntityManager.getCustomRepository(TestCaseRepository);
                const entity = await testCaseRepo.findOne(id, {
                    relations: [
                        "testSuite"
                    ]
                });
                const severityRepo = transactionalEntityManager.getCustomRepository(SeverityRepository);
                const priorityRepo = transactionalEntityManager.getCustomRepository(PriorityRepository);
                const userRepo = transactionalEntityManager.getCustomRepository(UserRepository);

                if (!entity) {
                    const notFoundError = new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Cases', id.toString()), 404);
                    return Promise.reject(notFoundError);
                }
                const user = await userRepo.findOne({
                    where: {
                        id: dto.userId
                    }
                });
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
                console.log("Updating test case:");
                entity.title = dto.title;
                entity.description = dto.description;
                entity.priority = priority;
                entity.severity = severity;
                entity.userInCharge = user;
                console.log(entity);
                const testCase = await testCaseRepo.save(entity);
                console.log("Test case updated successfully");
                const entityDto = plainToClass(TestCaseDTO, testCase);
                if (user) {
                    const userDto: CollaboratorDTO = {
                        uid: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    }
                    entityDto.userInCharge = userDto;
                    try {
                        await transporter.sendMail({
                            from: '"Prova Report" <' + process.env.SMTP_FROM_EMAIL + '>',
                            to: entityDto.userInCharge.email,
                            subject: "Se te asignó un caso de prueba",
                            html: `
                            <h1 style="color: #2e6c80;">Hola ${entityDto.userInCharge.firstName}, te han asignado un caso de prueba</h1>
                            <p>El nombre del caso de prueba es ${entityDto.title}</p>
                            <p><strong>Prioridad: </strong>${entityDto.priority.name}</p>
                            <p><strong>Severidad: </strong>${entityDto.severity.name}</p>
                            <h3 style="color: #2e6c80;">Puedes acceder al suite de pruebas desde este link: <a href="${'http://' + process.env.CLIENT_URL + '/detalle-suite-pruebas?suiteId=' + entity.testSuite.id}">TestSuite</a></h3>
                            `,
                        });
                    } catch (error) {
                        console.error(error);
                    }
                }
                return entityDto;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }
}
