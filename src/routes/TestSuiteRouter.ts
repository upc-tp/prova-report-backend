import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import * as express from 'express';
import { Request, Response, NextFunction } from "express";
import { container } from 'tsyringe';
import { BusinessError } from '../lib/common/business-error';
import { ProvaConstants } from '../lib/common/constants';
import { ResultResponse, SingleResponse } from '../lib/common/responses';
import { StringUtils } from '../lib/common/StringUtils';
import { TestSuiteSaveDTO } from '../lib/dtos/test-suite/TestSuiteSaveDTO';
import { TestSuiteUpdateDTO } from '../lib/dtos/test-suite/TestSuiteUpdateDTO';
import { authorize } from '../lib/middlewares/authorize';
import { TestSuiteService } from '../lib/services/TestSuiteService';

const _testSuiteService = container.resolve(TestSuiteService);

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let page = +req.query.page;
        let pageSize = +req.query.pageSize;
        let projectId = +req.query.projectId;
        const { sortOrder, search } = req.query;
        const [result, count] = await _testSuiteService.getPaged(page, pageSize, sortOrder as string, search as string, projectId);
        if (!page || !pageSize) {
            page = 1;
            pageSize = count;
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Test Suites');
        const response = ResultResponse(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const result = await _testSuiteService.getById(id);
        if(!result) {
            throw new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Suites', id.toString()), 404);
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Test Suites');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.post('/', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto: TestSuiteSaveDTO = plainToClass(TestSuiteSaveDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _testSuiteService.save(dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS, 'Test Suites');
        const response = SingleResponse(message, true, result);
        res.status(201).send(response);
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const dto: TestSuiteUpdateDTO = plainToClass(TestSuiteUpdateDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _testSuiteService.update(id, dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_PUT_SUCCESS, 'Test Suites');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

export = router;