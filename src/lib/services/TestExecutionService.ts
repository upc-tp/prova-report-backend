import { container, singleton } from "tsyringe";
import { ProvaConstants } from "../common/constants";
import { DatabaseManager } from "../database/DatabaseManager";
import { TestExecution } from "../models/TestExecution.entity";
import { TestCaseRepository } from "../repositories/TestCaseRepository";
import { TestExecutionRepository } from "../repositories/TestExecutionRepository";
import { TestExecutionStepRepository } from "../repositories/TestExecutionStepRepository";
import { TestStateRepository } from "../repositories/TestStateRepository";
import { TestSuiteRepository } from "../repositories/TestSuiteRepository";

import et = require('elementtree');
import { DateUtils } from "../common/DateUtils";
import { BusinessError } from "../common/business-error";
import { StringUtils } from "../common/StringUtils";
import { TestExecutionStep } from "../models/TestExecutionStep.entity";
import {LogMsg, StepLog} from "../interfaces/StepLog";

@singleton()
export class TestExecutionService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getPaged(page: number, pageSize: number, sortOrder: string = ProvaConstants.SORT_ORDER_DESC, testCaseId: number = null): Promise<[TestExecution[], number]> {
        try {
            const conn = await this._database.getConnection();
            const skip = (page - 1) * pageSize;
            const testExecutionRepo = conn.getCustomRepository(TestExecutionRepository);
            const qb = testExecutionRepo.createQueryBuilder("te")
                .innerJoinAndSelect('te.testState', 'ts')
                .where(`te.deleted_at is null`);

            if (testCaseId) {
                qb.andWhere(`te.test_case_id = ${testCaseId}`);
            }
            qb.orderBy({
                "te.order": sortOrder as any
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
            const testExecutionRepo = conn.getCustomRepository(TestExecutionRepository);
            const execution = await testExecutionRepo.findOne({ id }, {
                where: {
                    deletedAt: null,
                },
                relations: [
                    "testState",
                    "testExecutionSteps",
                    "testExecutionSteps.testState",
                    "testCase"
                ],
                withDeleted: true
            });
            return execution;
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async getByTestCaseIdAndOrder(testCaseId: number, order: number) {
        try {
            const conn = await this._database.getConnection();
            const testExecutionRepo = conn.getCustomRepository(TestExecutionRepository);
            const execution = await testExecutionRepo.findOne({
                where: {
                    testCase: {
                        id: testCaseId
                    },
                    order,
                    deletedAt: null,
                },
                relations: [
                    "testState",
                    "testExecutionSteps",
                    "testExecutionSteps.testState",
                    "testCase"
                ],
                withDeleted: true
            });
            return execution;
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    async save(testCaseId: number, xml: string, comments: string): Promise<TestExecution> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const testCaseRepo = transactionalEntityManager.getCustomRepository(TestCaseRepository);
                const testStateRepo = transactionalEntityManager.getCustomRepository(TestStateRepository);
                const testExecutionRepo = transactionalEntityManager.getCustomRepository(TestExecutionRepository);

                const entity = new TestExecution();

                const testCase = await testCaseRepo.findOne(testCaseId);
                if (!testCase) {
                    throw new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Caso de prueba', testCaseId.toString()), 404);
                }

                const etree = et.parse(xml);
                const testElement = etree.findall('.//test').find(tag => {
                    // Search a string that starts with "TC-"
                    // and ends with one or more digits between 0-9
                    // Then, extracts the digits section
                    const expression = /TC-([0-9]+)/;
                    const result = expression.exec(tag.attrib.name);
                    const id = parseInt(result[1])
                    return id === testCaseId;
                });

                const statusElement = testElement.find('status');
                const status = statusElement.get('status');
                const start = statusElement.get('starttime');
                const end = statusElement.get('endtime');

                let startTime = DateUtils.convertCustomFormatToDate(start);
                let endTime = DateUtils.convertCustomFormatToDate(end);
                let duration = DateUtils.getDifeferenceInMilliseconds(startTime, endTime);
                let order = testCase.lastExecution + 1;
                let testStateId = this.getTestStateId(status);
                let testState = await testStateRepo.findOne(testStateId);
                if (!testState) {
                    throw new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Estado de prueba', testStateId.toString()), 404);
                }

                console.log(`Updating test case ${testCaseId} with last execution: ${order}...`);
                await testCaseRepo.update(testCaseId, {
                    lastExecution: order,
                    testState: testState
                });
                console.log('test case updated successfully');

                entity.startTime = startTime;
                entity.endTime = endTime;
                entity.duration = duration;
                entity.order = order;
                testCase.lastExecution = order;
                testCase.testState = testState;
                entity.testCase = testCase;
                entity.testState = testState;
                entity.comments = comments;

                const keywords = testElement.findall('kw');
                const testExecutionSteps = await Promise.all(keywords.map(async (kw) => {
                    let step = new TestExecutionStep();
                    const sElement = kw.find('status');
                    const start = sElement.get('starttime');
                    const end = sElement.get('endtime');
                    const status = sElement.get('status');
                    const stateId = this.getTestStateId(status);
                    step.name = kw.get('name');
                    step.startTime = DateUtils.convertCustomFormatToDate(start);
                    step.endTime = DateUtils.convertCustomFormatToDate(end);
                    step.duration = DateUtils.getDifeferenceInMilliseconds(step.startTime, step.endTime);
                    step.testState = await testStateRepo.findOne(stateId);
                    const logsElement = kw.findall('kw');
                    step.logs = logsElement.map(kwTag => {
                        let log: StepLog;
                        const name = kwTag.get('name');
                        const status = kwTag.find('status');
                        const start = status.get('starttime');
                        const end = status.get('endtime');
                        const startTime = DateUtils.convertCustomFormatToDate(start);
                        const endTime = DateUtils.convertCustomFormatToDate(end);
                        const msgTags = kwTag.findall('msg');
                        const msgs = msgTags.map(m => {
                             let lm: LogMsg = {
                                 timestamp: DateUtils.convertCustomFormatToDate(m.get('timestamp')),
                                 level: m.get('level'),
                                 description: (m.text as string).trim()
                             };
                             return lm;
                        });
                        log = {
                            name,
                            status: {
                                startTime,
                                endTime,
                                duration: DateUtils.getDifeferenceInMilliseconds(startTime, endTime)
                            },
                            library: kwTag.get('library'),
                            msgs
                        };
                        return log;
                    });
                    return step;
                }));
                entity.testExecutionSteps = testExecutionSteps;
                console.log('Saving test execution: ', entity, '...');
                const testExecution = await testExecutionRepo.save(entity);
                console.log('Saved successfully');
                return testExecution;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    /**
     * Evaluate a string 'PASS', 'FAIL' or 'SKIP' and return test state id
     * @param  {string} status Test status
     * @return {Number}      Returns test state id
     */
    private getTestStateId(status: string): number {
        switch (status) {
            case 'PASS':
                return ProvaConstants.TEST_STATE_PASSED;
            case 'FAIL':
                return ProvaConstants.TEST_STATE_FAILED;
            case 'SKIP':
                return ProvaConstants.TEST_STATE_SKIPPED;
            default:
                return ProvaConstants.TEST_STATE_NOT_EXECUTED;
        }
    }
}