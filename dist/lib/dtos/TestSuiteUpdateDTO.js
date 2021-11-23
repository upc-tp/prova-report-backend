"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestSuiteUpdateDTO = void 0;
const class_validator_1 = require("class-validator");
const constants_1 = require("../common/constants");
class TestSuiteUpdateDTO {
}
__decorate([
    (0, class_validator_1.IsString)({
        message: constants_1.ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
], TestSuiteUpdateDTO.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)({
        message: constants_1.ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
], TestSuiteUpdateDTO.prototype, "description", void 0);
exports.TestSuiteUpdateDTO = TestSuiteUpdateDTO;
//# sourceMappingURL=TestSuiteUpdateDTO.js.map