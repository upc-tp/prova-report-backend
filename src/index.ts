import "reflect-metadata";
require('dotenv').config();

//#region Dependencies

import morgan = require('morgan');
import cors = require('cors');
import express = require('express');
import { container } from "tsyringe";
import { ProjectService } from "./lib/services/ProjectService";
import { StringUtils } from "./lib/common/StringUtils";
import { ProvaConstants } from "./lib/common/constants";
import { ResultResponse, SingleResponse } from "./lib/common/responses";
import { ProjectSaveDTO } from "./lib/dtos/ProjectSaveDTO";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";

//#endregion

const PORT = process.env.PORT || 3000;
const app = express();

//#region Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('tiny'));
//#endregion

const _projectService = container.resolve(ProjectService);

app.get('/api/projects', async (req: Request, res: Response, next: NextFunction) => {
    try {
        let page = +req.query.page;
        let pageSize = +req.query.pageSize;
        const { sortOrder, search } = req.query;
        const [result, count] = await _projectService.getPaged(page, pageSize, sortOrder as string, search as string);
        if (!page || !pageSize) {
            page = 1;
            pageSize = count;
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Projects');
        const response = ResultResponse(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

app.post('/api/projects', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto: ProjectSaveDTO = plainToClass(ProjectSaveDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _projectService.save(dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS, 'Projects');
        const response = SingleResponse(message, true, result);
        res.status(201).send(response);
    } catch (error) {
        return next(error);
    }
});

app.put('/api/projects/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const dto: ProjectSaveDTO = plainToClass(ProjectSaveDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _projectService.update(id, dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_PUT_SUCCESS, 'Projects');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
})

app.listen(PORT, () => {
    console.log(`Prove Report backend listening at port: ${PORT}`);
});