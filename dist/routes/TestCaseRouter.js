"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const express = __importStar(require("express"));
const tsyringe_1 = require("tsyringe");
const business_error_1 = require("../lib/common/business-error");
const constants_1 = require("../lib/common/constants");
const responses_1 = require("../lib/common/responses");
const StringUtils_1 = require("../lib/common/StringUtils");
const TestCaseSaveDTO_1 = require("../lib/dtos/TestCaseSaveDTO");
const TestCaseUpdateDTO_1 = require("../lib/dtos/TestCaseUpdateDTO");
const TestCaseService_1 = require("../lib/services/TestCaseService");
const _testCaseService = tsyringe_1.container.resolve(TestCaseService_1.TestCaseService);
const router = express.Router();
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let page = +req.query.page;
        let pageSize = +req.query.pageSize;
        let testSuiteId = +req.query.testSuiteId;
        const { sortOrder, search } = req.query;
        const [result, count] = yield _testCaseService.getPaged(page, pageSize, sortOrder, search, testSuiteId);
        if (!page || !pageSize) {
            page = 1;
            pageSize = count;
        }
        const message = StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Test Cases');
        const response = (0, responses_1.ResultResponse)(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    }
    catch (error) {
        return next(error);
    }
}));
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = +req.params.id;
        const result = yield _testCaseService.getById(id);
        if (!result) {
            throw new business_error_1.BusinessError(StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND, 'Test Cases', id.toString()), 404);
        }
        const message = StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Test Cases');
        const response = (0, responses_1.SingleResponse)(message, true, result);
        res.status(200).send(response);
    }
    catch (error) {
        return next(error);
    }
}));
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dto = (0, class_transformer_1.plainToClass)(TestCaseSaveDTO_1.TestCaseSaveDTO, req.body);
        const errors = yield (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = yield _testCaseService.save(dto);
        const message = StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS, 'Test Cases');
        const response = (0, responses_1.SingleResponse)(message, true, result);
        res.status(201).send(response);
    }
    catch (error) {
        return next(error);
    }
}));
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = +req.params.id;
        const dto = (0, class_transformer_1.plainToClass)(TestCaseUpdateDTO_1.TestCaseUpdateDTO, req.body);
        const errors = yield (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = yield _testCaseService.update(id, dto);
        const message = StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_PUT_SUCCESS, 'Test Cases');
        const response = (0, responses_1.SingleResponse)(message, true, result);
        res.status(200).send(response);
    }
    catch (error) {
        return next(error);
    }
}));
module.exports = router;
//# sourceMappingURL=TestCaseRouter.js.map