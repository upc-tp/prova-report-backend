import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import * as express from 'express';
import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { BusinessError } from '../lib/common/business-error';
import { ProvaConstants } from '../lib/common/constants';
import { ResultResponse, SingleResponse } from '../lib/common/responses';
import { StringUtils } from '../lib/common/StringUtils';
import { TestCaseSaveDTO } from '../lib/dtos/test-case/TestCaseSaveDTO';
import { TestCaseUpdateDTO } from '../lib/dtos/test-case/TestCaseUpdateDTO';
import { authorize } from '../lib/middlewares/authorize';
import { TestCaseService } from "../lib/services/TestCaseService";

import xmlparser = require('express-xml-bodyparser');
import { TestExecutionService } from '../lib/services/TestExecutionService';


const _testCaseService = container.resolve(TestCaseService);
const _testExecutionService = container.resolve(TestExecutionService);

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let page = +req.query.page;
        let pageSize = +req.query.pageSize;
        let testSuiteId = +req.query.testSuiteId;
        const { sortOrder, search } = req.query;
        const [result, count] = await _testCaseService.getPaged(page, pageSize, sortOrder as string, search as string, testSuiteId);
        if (!page || !pageSize) {
            page = 1;
            pageSize = count;
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Caso de prueba');
        const response = ResultResponse(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const result = await _testCaseService.getById(id);
        if(!result) {
            throw new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Caso de prueba', id.toString()), 404);
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Caso de prueba');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.get('/:id/test-executions', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        let page = +req.query.page;
        let pageSize = +req.query.pageSize;
        const { sortOrder } = req.query;
        const [result, count] = await _testExecutionService.getPaged(page, pageSize, sortOrder as string, id);
        if (!page || !pageSize) {
            page = 1;
            pageSize = count;
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Ejecuciones de caso de prueba');
        const response = ResultResponse(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.get('/:id/last-execution', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const testCase = await _testCaseService.getById(id);
        if(!testCase) {
            throw new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Caso de prueba', id.toString()), 404);
        }
        const result = await _testExecutionService.getByTestCaseIdAndOrder(testCase.id, testCase.lastExecution);
        if(!result) {
            throw new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Ejecucion de caso de prueba', id.toString()), 404);
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Ejecucion de caso de prueba');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.post('/', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto: TestCaseSaveDTO = plainToClass(TestCaseSaveDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _testCaseService.save(dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS, 'Caso de prueba');
        const response = SingleResponse(message, true, result);
        res.status(201).send(response);
    } catch (error) {
        return next(error);
    }
});

router.post('/:id/test-executions', authorize(['Admin', 'Tester']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const buffer = req.body;
        const xml = buffer.toString();
        const result = await _testExecutionService.save(id, xml);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS, 'Ejecución');
        const response = SingleResponse(message, true, result);
        res.status(201).send(response);
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const dto: TestCaseUpdateDTO = plainToClass(TestCaseUpdateDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _testCaseService.update(id, dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_PUT_SUCCESS, 'Caso de prueba');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

export = router;