"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessError = void 0;
class BusinessError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
exports.BusinessError = BusinessError;
//# sourceMappingURL=business-error.js.map