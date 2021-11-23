"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const business_error_1 = require("../common/business-error");
const responses_1 = require("../common/responses");
const class_validator_1 = require("class-validator");
function errorHandler(err, req, res, next) {
    console.error(err);
    let code = 500;
    let response;
    if (err instanceof business_error_1.BusinessError) {
        code = err.code;
        response = (0, responses_1.SingleResponse)(err.message, false);
    }
    else if (err instanceof Array && err[0] instanceof class_validator_1.ValidationError) {
        code = 400;
        let message = "";
        err.forEach(validationError => {
            for (const validationMessage of Object.values(validationError.constraints)) {
                message = message.concat(`${validationMessage}\n`);
            }
        });
        response = (0, responses_1.SingleResponse)(message, false);
    }
    else {
        response = (0, responses_1.SingleResponse)(err.message, false);
    }
    res.status(code).send(response);
}
exports.errorHandler = errorHandler;
//# sourceMappingURL=error-handler.js.map