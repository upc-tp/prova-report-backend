import * as express from 'express'
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { BusinessError } from "../lib/common/business-error";
import { ProvaConstants } from "../lib/common/constants";
import { ResultResponse, SingleResponse } from "../lib/common/responses";
import { StringUtils } from "../lib/common/StringUtils";
import { UserStorySaveDTO } from '../lib/dtos/UserStorySaveDTO';
import { UserStoryService } from "../lib/services/UserStoryService";
import { authorize } from '../lib/middlewares/authorize';

const _userStoryService = container.resolve(UserStoryService);
const router = express.Router();

router.get('/' , async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = 1;
        const [result, count] = await _userStoryService.getAll();
        const pageSize = count;
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'User Story');
        const response = ResultResponse(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.get('/id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const result = await _userStoryService.getById(id);
        if(!result) {
            throw new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'User Story', id.toString()), 404);
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'User Story');
        const response = SingleResponse(message, true, result);
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
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS, 'User Story');
        const response = SingleResponse(message, true, result);
        res.status(201).send(response);
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', authorize(['Admin']), async(req: Request, res:Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const dto: UserStorySaveDTO = plainToClass(UserStorySaveDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _userStoryService.update(id, dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_PUT_SUCCESS, 'User Story');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

export = router;