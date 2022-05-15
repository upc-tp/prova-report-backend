import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import * as express from 'express';
import { Request, Response, NextFunction } from "express";
import { container } from 'tsyringe';
import { BusinessError } from '../lib/common/business-error';
import { ProvaConstants } from '../lib/common/constants';
import { ResultResponse, SingleResponse } from '../lib/common/responses';
import { StringUtils } from '../lib/common/StringUtils';
import { authorize } from '../lib/middlewares/authorize';
import { TestPlanService } from '../lib/services/TestPlanService';
import { TestPlanSaveDTO } from '../lib/dtos/test-plan/TestPlanSaveDTO';
import { TestPlanUpdateDTO } from '../lib/dtos/test-plan/TestPlanUpdateDTO';
import { DateUtils } from '../lib/common/DateUtils';

const _testPlanService = container.resolve(TestPlanService);

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let page = +req.query.page;
        let pageSize = +req.query.pageSize;
        let projectId = +req.query.projectId;
        const { sortOrder, search } = req.query;
        const [result, count] = await _testPlanService.getPaged(page, pageSize, sortOrder as string, search as string, projectId);
        if (!page || !pageSize) {
            page = 1;
            pageSize = count;
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Plan de prueba');
        const response = ResultResponse(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const result = await _testPlanService.getById(id);
        if(!result) {
            throw new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Plan de prueba', id.toString()), 404);
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Plan de prueba');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.get('/:id/pdf', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const reportDate = DateUtils.formatToDayMonthAndYear(new Date());
        const result = await _testPlanService.getPdf(id, reportDate);
        if(!result) {
            throw new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Plan de prueba', id.toString()), 404);
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=plan-de-pruebas-${reportDate}.pdf`);
        res.status(200).send(result);
    } catch (error) {
        return next(error);
    }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto: TestPlanSaveDTO = plainToClass(TestPlanSaveDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _testPlanService.save(dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS, 'Plan de prueba');
        const response = SingleResponse(message, true, result);
        res.status(201).send(response);
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const dto: TestPlanUpdateDTO = plainToClass(TestPlanUpdateDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _testPlanService.update(id, dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_PUT_SUCCESS, 'Plan de prueba');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

export = router;