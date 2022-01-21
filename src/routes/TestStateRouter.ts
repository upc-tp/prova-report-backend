import * as express from 'express';
import { Request, Response, NextFunction } from "express";
import { container } from 'tsyringe';
import { ProvaConstants } from '../lib/common/constants';
import { ResultResponse } from '../lib/common/responses';
import { StringUtils } from '../lib/common/StringUtils';
import { TestStateService } from '../lib/services/TestStateService';

const _testStateService = container.resolve(TestStateService);

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = 1;
        const [result, count] = await _testStateService.getAll();
        const pageSize = count;
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Test States');
        const response = ResultResponse(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

export = router;