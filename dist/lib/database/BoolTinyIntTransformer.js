"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoolTinyIntTransformer = void 0;
class BoolTinyIntTransformer {
    to(value) {
        if (value === null) {
            return null;
        }
        return value ? 1 : 0;
    }
    from(value) {
        if (value === null) {
            return null;
        }
        return value === 1;
    }
}
exports.BoolTinyIntTransformer = BoolTinyIntTransformer;
//# sourceMappingURL=BoolTinyIntTransformer.js.map