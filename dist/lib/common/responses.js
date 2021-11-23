"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleResponse = exports.ResultResponse = void 0;
function ResultResponse(page, pageSize, count, message, success, result) {
    const response = {
        page,
        pageSize,
        count,
        message,
        success,
        result
    };
    return response;
}
exports.ResultResponse = ResultResponse;
function SingleResponse(message, success, result = null) {
    const response = {
        message,
        success,
        result
    };
    return response;
}
exports.SingleResponse = SingleResponse;
//# sourceMappingURL=responses.js.map