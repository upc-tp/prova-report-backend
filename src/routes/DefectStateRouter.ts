import * as express from 'express';
import { Request, Response, NextFunction } from "express";
import { container } from 'tsyringe';
import { ProvaConstants } from '../lib/common/constants';
import { ResultResponse } from '../lib/common/responses';
import { StringUtils } from '../lib/common/StringUtils';
import { DefectStateService } from '../lib/services/DefectStateService';

const _defectStateService = container.resolve(DefectStateService);

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = 1;
        const [result, count] = await _defectStateService.getAll();
        const pageSize = count;
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Estado');
        const response = ResultResponse(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

export = router;