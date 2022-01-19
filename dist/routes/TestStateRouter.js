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
const express = __importStar(require("express"));
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../lib/common/constants");
const responses_1 = require("../lib/common/responses");
const StringUtils_1 = require("../lib/common/StringUtils");
const TestStateService_1 = require("../lib/services/TestStateService");
const _testStateService = tsyringe_1.container.resolve(TestStateService_1.TestStateService);
const router = express.Router();
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = 1;
        const [result, count] = yield _testStateService.getAll();
        const pageSize = count;
        const message = StringUtils_1.StringUtils.format(constants_1.ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS, 'Test States');
        const response = (0, responses_1.ResultResponse)(page, pageSize, count, message, true, result);
        res.status(200).send(response);
    }
    catch (error) {
        return next(error);
    }
}));
module.exports = router;
//# sourceMappingURL=TestStateRouter.js.map