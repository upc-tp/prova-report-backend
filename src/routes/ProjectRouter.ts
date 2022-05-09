import * as express from 'express';
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { BusinessError } from "../lib/common/business-error";
import { ProvaConstants } from "../lib/common/constants";
import { ResultResponse, SingleResponse } from "../lib/common/responses";
import { StringUtils } from "../lib/common/StringUtils";
import { ProjectSaveDTO } from "../lib/dtos/ProjectSaveDTO";
import { ProjectService } from "../lib/services/ProjectService";
import { authorize } from '../lib/middlewares/authorize';
import { RegisterDTO } from '../lib/dtos/RegisterDTO';

const _projectService = container.resolve(ProjectService);
const router = express.Router();

router.get('/' , async (req: Request, res: Response, next: NextFunction) => {
    try {
        let page = +req.query.page;
        let pageSize = +req.query.pageSize;
        const { sortOrder, search } = req.query;
        const [result, count] = await _projectService.getPaged(page, pageSize, sortOrder as string, search as string);
        if (!page || !pageSize) {
            page = 1;
            pageSize = count;
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Proyecto de prueba');
        const response = ResultResponse(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const result = await _projectService.getById(id);
        if(!result) {
            throw new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Proyecto de prueba', id.toString()), 404);
        } 
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Proyecto de prueba');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.get('/:id/collaborators', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        let page = +req.query.page;
        let pageSize = +req.query.pageSize;
        const { sortOrder, search } = req.query;
        const [result, count] = await _projectService.getCollaborators(page, pageSize, sortOrder as string, search as string, id);
        if (!page || !pageSize) {
            page = 1;
            pageSize = count;
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Colaborador de proyecto');
        const response = ResultResponse(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.get('/:id/no-collaborators', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        let page = +req.query.page;
        let pageSize = +req.query.pageSize;
        const { sortOrder, search } = req.query;
        const [result, count] = await _projectService.getNoCollaborators(page, pageSize, sortOrder as string, search as string, id);
        if (!page || !pageSize) {
            page = 1;
            pageSize = count;
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'No Colaborador de proyecto');
        const response = ResultResponse(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.post('/', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto: ProjectSaveDTO = plainToClass(ProjectSaveDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _projectService.save(dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS, 'Proyecto de prueba');
        const response = SingleResponse(message, true, result);
        res.status(201).send(response);
    } catch (error) {
        return next(error);
    }
});

router.post('/:id/collaborators', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const dto: RegisterDTO = plainToClass(RegisterDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _projectService.addCollaborator(id, dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS, 'Colaborador de proyecto');
        const response = SingleResponse(message, true, result);
        res.status(201).send(response);
    } catch (error) {
        return next(error);
    }
});


router.post('/:id/collaborators/:userId', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const userId = +req.params.userId;
        const result = await _projectService.assignCollaborator(id, userId);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS, 'Colaborador de proyecto');
        const response = SingleResponse(message, true, result);
        res.status(201).send(response);
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const dto: ProjectSaveDTO = plainToClass(ProjectSaveDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _projectService.update(id, dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_PUT_SUCCESS, 'Proyecto de prueba');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

export = router;