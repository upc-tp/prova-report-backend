"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvaConstants = void 0;
class ProvaConstants {
}
exports.ProvaConstants = ProvaConstants;
//#region Custom Messages
ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS = "{0}: Retrieved successfully";
ProvaConstants.MESSAGE_RESPONSE_POST_SUCCESS = "{0}: Created successfully";
ProvaConstants.MESSAGE_RESPONSE_PUT_SUCCESS = "{0}: Modified successfully";
ProvaConstants.MESSAGE_RESPONSE_DELETE_SUCCESS = "{0}: Deleted successfully";
ProvaConstants.MESSAGE_RESPONSE_NOT_FOUND = "Element {0} with id: {1} not found";
ProvaConstants.VALIDATION_MESSAGE_IS_STRING = "$property should be text";
ProvaConstants.VALIDATION_MESSAGE_IS_FLOAT = "$property should be float";
ProvaConstants.VALIDATION_MESSAGE_IS_BOOLEAN = "$property should be boolean";
ProvaConstants.VALIDATION_MESSAGE_IS_INT = "$property should be integer";
ProvaConstants.VALIDATION_MESSAGE_IS_EMAIL = "$property should be email";
ProvaConstants.VALIDATION_MESSAGE_IS_ARRAY = "$property should be array";
ProvaConstants.VALIDATION_MESSAGE_IS_DATE_STRING = "$property should be date (ISO String)";
ProvaConstants.VALIDATION_MESSAGE_FIXED_LENGTH = "$property: should have $constraint1 characters.";
ProvaConstants.VALIDATION_MESSAGE_IS_NOT_EMPTY = "$property should not be empty";
//#endregion
//#region Defaults
ProvaConstants.SORT_ORDER_ASC = "ASC";
ProvaConstants.SORT_ORDER_DESC = "DESC";
ProvaConstants.CONNECTION_DEV_DEFAULT_NAME = 'mysql-conn-dev';
ProvaConstants.VALIDATION_DEFAULT_DECIMAL_PLACES = 2;
ProvaConstants.VALIDATION_DEFAULT_DECIMAL_PLACES_COMISION = 2;
ProvaConstants.VALIDATION_DEFAULT_DECIMAL_PLACES_PRECIO = 2;
ProvaConstants.VALIDATION_DEFAULT_LENGTH_RUC = 11;
//#endregion
//#region Business Rules
ProvaConstants.AUTH0_CLAIMS_DOMAIN = "https://rollosnp.com";
ProvaConstants.TEST_STATE_NOT_EXECUTED = 1;
ProvaConstants.TEST_STATE_PASSED = 2;
ProvaConstants.TEST_STATE_FAILED = 3;
ProvaConstants.TEST_STATE_SKIPPED = 4;
ProvaConstants.TEST_STATE_BROKEN = 5;
//# sourceMappingURL=constants.js.map