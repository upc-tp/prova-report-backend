import * as express from 'express';
import { Request, Response, NextFunction } from "express";
import { container } from 'tsyringe';
import { BusinessError } from '../lib/common/business-error';
import { ProvaConstants } from '../lib/common/constants';
import { SingleResponse } from '../lib/common/responses';
import { StringUtils } from '../lib/common/StringUtils';
import { TestExecutionService } from '../lib/services/TestExecutionService';

const _testExecutionService = container.resolve(TestExecutionService);

const router = express.Router();

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = +req.params.id;
        const result = await _testExecutionService.getById(id);
        if(!result) {
            throw new BusinessError(StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Ejecucion de caso de prueba', id.toString()), 404);
        }
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Ejecucion de caso de prueba');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

export = router;