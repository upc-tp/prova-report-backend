"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require('dotenv').config();
//#region Dependencies
const morgan = require("morgan");
const cors = require("cors");
const express = require("express");
const tsyringe_1 = require("tsyringe");
const ProjectService_1 = require("./lib/services/ProjectService");
const StringUtils_1 = require("./lib/common/StringUtils");
const constants_1 = require("./lib/common/constants");
const responses_1 = require("./lib/common/responses");
const ProjectSaveDTO_1 = require("./lib/dtos/ProjectSaveDTO");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
//#endregion
const PORT = process.env.PORT || 3000;
const app = express();
//#region Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('tiny'));
//#endregion
const _projectService = tsyringe_1.container.resolve(ProjectService_1.ProjectService);
app.get('/api/projects', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let page = +req.query.page;
        let pageSize = +req.query.pageSize;
        const { sortOrder, search } = req.query;
        const [result, count] = yield _projectService.getPaged(page, pageSize, sortOrder, search);
        if (!page || !pageSize) {
            page = 1;
            pageSize = count;
        }
        const message = StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Projects');
        const response = (0, responses_1.ResultResponse)(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    }
    catch (error) {
        return next(error);
    }
}));
app.post('/api/projects', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dto = (0, class_transformer_1.plainToClass)(ProjectSaveDTO_1.ProjectSaveDTO, req.body);
        const errors = yield (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = yield _projectService.save(dto);
        const message = StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS, 'Projects');
        const response = (0, responses_1.SingleResponse)(message, true, result);
        res.status(201).send(response);
    }
    catch (error) {
        return next(error);
    }
}));
app.put('/api/projects/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = +req.params.id;
        const dto = (0, class_transformer_1.plainToClass)(ProjectSaveDTO_1.ProjectSaveDTO, req.body);
        const errors = yield (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = yield _projectService.update(id, dto);
        const message = StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_PUT_SUCCESS, 'Projects');
        const response = (0, responses_1.SingleResponse)(message, true, result);
        res.status(200).send(response);
    }
    catch (error) {
        return next(error);
    }
}));
app.listen(PORT, () => {
    console.log(`Prove Report backend listening at port: ${PORT}`);
});
//# sourceMappingURL=index.js.map