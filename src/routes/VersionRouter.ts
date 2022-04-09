import * as express from 'express';
import { container } from "tsyringe";
import { VersionService } from "../lib/services/VersionService";
import { Request, Response, NextFunction } from "express";
import { StringUtils } from "../lib/common/StringUtils";
import { ProvaConstants } from "../lib/common/constants";
import {ResultResponse, SingleResponse} from "../lib/common/responses";
import {BusinessError} from "../lib/common/business-error";
import {authorize} from "../lib/middlewares/authorize";
import {VersionSaveDTO} from "../lib/dtos/version/VersionSaveDTO";
import {plainToClass} from "class-transformer";
import {validate} from "class-validator";
import {VersionUpdateDTO} from "../lib/dtos/version/VersionUpdateDTO";

const _versionService = container.resolve(VersionService);
const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let page = +req.query.page;
        let pageSize = +req.query.pageSize;
        let projectId = +req.query.projectId;
        const { sortOrder, search } = req.query;
        const [ result, count ] = await _versionService.getPaged(page, pageSize, sortOrder as string, search as string, projectId);
        if (!page || !pageSize) {
            page = 1;
            pageSize = count;
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Version');
        const response = ResultResponse(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.get('/:id', async (req:Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const result = await _versionService.getById(id);
        if(!result) {
            throw new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Version', id.toString()), 404);
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Spring');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    }catch (error){
        return next(error);
    }
});

router.post('/', authorize(['Admin']), async (req:Request, res: Response, next: NextFunction) => {
   try {
       const dto: VersionSaveDTO = plainToClass(VersionSaveDTO, req.body);
       const errors = await validate(dto);
       if (errors.length > 0){
           return next(errors);
       }
       const result = await _versionService.save(dto);
       const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS, 'Version');
       const response = SingleResponse(message, true, result);
       res.status(201).send(response);
   } catch (error){
       return next(error);
   }
});

router.put('/:id', authorize(['Admin']), async (req: Request,res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const dto: VersionUpdateDTO = plainToClass(VersionUpdateDTO, req.body);
        const errors = await validate(dto);
        if(errors.length > 0){
            return next(errors);
        }
        const result = await _versionService.update(id, dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_PUT_SUCCESS, 'Version');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error){
        return next(error);
    }
});

export = router;
