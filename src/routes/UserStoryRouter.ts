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
import { UserStoryCriteriaUpdateDTO } from '../lib/dtos/user-story/UserStoryCriteriaUpdateDTO';
import { UserStorySaveDTO } from '../lib/dtos/user-story/UserStorySaveDTO';
import { UserStoryUpdateDTO } from '../lib/dtos/user-story/UserStoryUpdateDTO';
import { authorize } from '../lib/middlewares/authorize';
import { TestSuiteService } from '../lib/services/TestSuiteService';
import { UserStoryService } from '../lib/services/UserStoryService';

const _userStoryService = container.resolve(UserStoryService);

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let page = +req.query.page;
        let pageSize = +req.query.pageSize;
        let projectId = +req.query.projectId;
        const { sortOrder} = req.query;
        const [result, count] = await _userStoryService.getPaged(page, pageSize, sortOrder as string, projectId);
        if (!page || !pageSize) {
            page = 1;
            pageSize = count;
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Historia de Usuario');
        const response = ResultResponse(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.post('/', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto: UserStorySaveDTO = plainToClass(UserStorySaveDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _userStoryService.save(dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS, 'Historia de Usuario');
        const response = SingleResponse(message, true, result);
        res.status(201).send(response);
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const dto: UserStoryUpdateDTO = plainToClass(UserStoryUpdateDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _userStoryService.update(id, dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_PUT_SUCCESS, 'Historia de Usuario');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.put('/criteria/:id', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const dto: UserStoryCriteriaUpdateDTO = plainToClass(UserStoryCriteriaUpdateDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _userStoryService.updateCriteria(id, dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_PUT_SUCCESS, 'Criteria de Aceptación');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});


export = router;