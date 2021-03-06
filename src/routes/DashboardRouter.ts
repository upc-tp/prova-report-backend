import * as express from 'express';
import { Request, Response, NextFunction } from "express";
import { container } from 'tsyringe';
import { ProvaConstants } from '../lib/common/constants';
import { SingleResponse } from '../lib/common/responses';
import { StringUtils } from '../lib/common/StringUtils';
import { DashboardService } from '../lib/services/DashboardService';

const _dashboardService = container.resolve(DashboardService);

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const projectId = +req.query.projectId;
        const testPlanId = +req.query.testPlanId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const result = await _dashboardService.getData(projectId, testPlanId, startDate as string, endDate as string);
        const message = StringUtils.format(ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Dashboard');
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

export = router;