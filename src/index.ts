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
import { ResultResponse } from "./lib/common/responses";

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

app.get('/api/projects', async (req, res, next) => {
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

app.listen(PORT, () => {
    console.log(`Prove Report backend listening at port: ${PORT}`);
});