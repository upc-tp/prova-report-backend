import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import * as express from 'express';
import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { BusinessError } from '../lib/common/business-error';
import { ProvaConstants } from '../lib/common/constants';
import { DateUtils } from '../lib/common/DateUtils';
import { ResultResponse, SingleResponse } from '../lib/common/responses';
import { StringUtils } from '../lib/common/StringUtils';
import { DefectBulkUpdateDTO } from '../lib/dtos/defect/DefectBulkUpdateDTO';
import { DefectSaveDTO } from '../lib/dtos/defect/DefectSaveDTO';
import { DefectUpdateDTO } from '../lib/dtos/defect/DefectUpdateDTO';
import { authorize } from '../lib/middlewares/authorize';
import { DefectService } from "../lib/services/DefectService";

const _defectService = container.resolve(DefectService);

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let page = +req.query.page;
        let pageSize = +req.query.pageSize;
        const { sortOrder, search } = req.query;
        let projectId = +req.query.projectId;

        let defectStateId = null;
        if (req.query.defectStateId) {
            defectStateId = req.query.defectStateId.toString().split(',').map(x => +x);
        }

        let is_fixed = +req.query.is_fixed;
        const [result, count] = await _defectService.getPage(page, pageSize, sortOrder as string, search as string, projectId, defectStateId, is_fixed);
        if (!page || !pageSize) {
            page = 1;
            pageSize = count;
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Defecto');
        const response = ResultResponse(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const result = await _defectService.getById(id);
        if (!result) {
            throw new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Defecto', id.toString()), 404);
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Defectos');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.post('/', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto: DefectSaveDTO = plainToClass(DefectSaveDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _defectService.save(dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS, 'Defecto');
        const response = SingleResponse(message, true, result);
        res.status(201).send(response);
    } catch (error) {
        return next(error);
    }
});

router.post('/bulk', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto: DefectBulkUpdateDTO = plainToClass(DefectBulkUpdateDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _defectService.bulkUpdate(dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_PUT_SUCCESS, 'Defectos');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const dto: DefectUpdateDTO = plainToClass(DefectUpdateDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _defectService.update(id, dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_PUT_SUCCESS, 'Defecto');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.get('/:projectId/:testSuiteId/pdf', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const projectId = +req.params.projectId;
        const testSuiteId = +req.params.testSuiteId;
        const reportDate = DateUtils.formatToDayMonthAndYear(new Date());
        const result = await _defectService.getPdf(projectId, testSuiteId, reportDate);
        if (!result) {
            throw new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Defectos del proyecto y test suite', projectId.toString(), testSuiteId.toString()), 404);
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=plan-de-pruebas-${reportDate}.pdf`);
        res.status(200).send(result);
    } catch (error) {
        return next(error);
    }
});

export = router;