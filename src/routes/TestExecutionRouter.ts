import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { BusinessError } from "../lib/common/business-error";
import { ProvaConstants } from "../lib/common/constants";
import { ResultResponse, SingleResponse } from "../lib/common/responses";
import { StringUtils } from "../lib/common/StringUtils";
import { TestExecutionSaveDTO } from "../lib/dtos/test-execution/TestExecutionSaveDTO";
import { TestExecutionUpdateDTO } from "../lib/dtos/test-execution/TestExecutionUpdateDTO";
import { authorize } from "../lib/middlewares/authorize";
import { TestExecutionService } from "../lib/services/TestExecutionService";

const _testExecutionService = container.resolve(TestExecutionService);

const router = express.Router();

router.get('/', async(req: Request, res: Response, next: NextFunction) => {
    try {
        let page = +req.query.page;
        let pageSize = +req.query.pageSize;
        let testCaseId = +req.query.testCaseId;
        const { sortOrder, search } = req.query;
        const [result, count] = await _testExecutionService.getPaged(page, pageSize, sortOrder as string, search as string, testCaseId);
        if (!page || !pageSize) {
            page = 1;
            pageSize = count;
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Test execution');
        const response = ResultResponse(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    }   catch (error) {
        return next(error);
    }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const result = await _testExecutionService.getById(id);
        if(!result) {
            throw new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Execution', id.toString()), 404);
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Test Execution');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.post('/', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto: TestExecutionSaveDTO = plainToClass(TestExecutionSaveDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _testExecutionService.save(dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS, 'Test Execution');
        const response = SingleResponse(message, true, result);
        res.status(201).send(response);
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const dto: TestExecutionUpdateDTO = plainToClass(TestExecutionUpdateDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _testExecutionService.update(id, dto);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_PUT_SUCCESS, 'Test Execution');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

export = router;