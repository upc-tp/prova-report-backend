
export class ProvaConstants {
    //#region Custom Messages
    
    public static readonly MESSAGE_RESPONSE_GET_SUCCESS : string = "{0}: Retrieved successfully";
    public static readonly MESSAGE_RESPONSE_POST_SUCCESS : string = "{0}: Created successfully";
    public static readonly MESSAGE_RESPONSE_PUT_SUCCESS : string = "{0}: Modified successfully";
    public static readonly MESSAGE_RESPONSE_DELETE_SUCCESS : string = "{0}: Deleted successfully";
    public static readonly MESSAGE_RESPONSE_NOT_FOUND : string = "Element {0} with id: {1} not found";

    public static readonly VALIDATION_MESSAGE_IS_STRING: string = "$property should be text";
    public static readonly VALIDATION_MESSAGE_IS_FLOAT: string = "$property should be float";
    public static readonly VALIDATION_MESSAGE_IS_BOOLEAN: string = "$property should be boolean";
    public static readonly VALIDATION_MESSAGE_IS_INT: string = "$property should be integer";
    public static readonly VALIDATION_MESSAGE_IS_EMAIL: string = "$property should be email";
    public static readonly VALIDATION_MESSAGE_IS_ARRAY: string = "$property should be array";
    public static readonly VALIDATION_MESSAGE_IS_DATE_STRING: string = "$property should be date (ISO String)";
    public static readonly VALIDATION_MESSAGE_FIXED_LENGTH: string = "$property: should have $constraint1 characters.";
    public static readonly VALIDATION_MESSAGE_IS_NOT_EMPTY: string = "$property should not be empty";

    //#endregion
    
    //#region Defaults

    public static readonly SORT_ORDER_ASC : string = "ASC";
    public static readonly SORT_ORDER_DESC : string = "DESC";

    public static readonly CONNECTION_DEV_DEFAULT_NAME: string = 'mysql-conn-dev';

    public static readonly VALIDATION_DEFAULT_DECIMAL_PLACES: number = 2;
    public static readonly VALIDATION_DEFAULT_DECIMAL_PLACES_COMISION: number = 2;
    public static readonly VALIDATION_DEFAULT_DECIMAL_PLACES_PRECIO: number = 2;
    public static readonly VALIDATION_DEFAULT_LENGTH_RUC: number = 11;

    //#endregion

    //#region Business Rules

    public static readonly AUTH0_CLAIMS_DOMAIN = "https://rollosnp.com";

    public static readonly TEST_STATE_SKIPPED = 1;
    public static readonly TEST_STATE_PASSED = 2;
    public static readonly TEST_STATE_FAILED = 3;
    public static readonly TEST_STATE_BROKEN = 4;

    //#endregion
}