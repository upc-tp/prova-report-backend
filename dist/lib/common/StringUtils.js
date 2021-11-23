"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtils = void 0;
class StringUtils {
    static format(...params) {
        const value = params[0];
        let args = Array.prototype.slice.call(params, 1);
        return value.replace(/{(\d+)}/g, (match, number) => {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match;
        });
    }
    static add_time(field) {
        return field + "_" + Date.now().toString().slice(5, 13);
    }
    ;
}
exports.StringUtils = StringUtils;
//# sourceMappingURL=StringUtils.js.map