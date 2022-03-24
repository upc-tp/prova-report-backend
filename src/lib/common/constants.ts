
export class ProvaConstants {
    //#region Custom Messages
    
    public static readonly MESSAGE_RESPONSE_GET_SUCCESS : string = "{0}: Obtenido satisfactoriamente";
    public static readonly MESSAGE_RESPONSE_POST_SUCCESS : string = "{0}: Registrado satisfactoriamente";
    public static readonly MESSAGE_RESPONSE_PUT_SUCCESS : string = "{0}: Actualizado satisfactoriamente";
    public static readonly MESSAGE_RESPONSE_DELETE_SUCCESS : string = "{0}: Eliminado satifactoriamente";
    public static readonly MESSAGE_RESPONSE_NOT_FOUND : string = "El objeto {0} con id: {1} no se ha encontrado";

    public static readonly VALIDATION_MESSAGE_IS_STRING: string = "$property debe ser texto";
    public static readonly VALIDATION_MESSAGE_IS_FLOAT: string = "$property debe ser flotante";
    public static readonly VALIDATION_MESSAGE_IS_BOOLEAN: string = "$property debe ser booleano";
    public static readonly VALIDATION_MESSAGE_IS_INT: string = "$property debe ser entero";
    public static readonly VALIDATION_MESSAGE_IS_EMAIL: string = "$property debe ser un email válido";
    public static readonly VALIDATION_MESSAGE_IS_ARRAY: string = "$property debe ser un array";
    public static readonly VALIDATION_MESSAGE_IS_DATE_STRING: string = "$property debe ser una fecha (ISO String)";
    public static readonly VALIDATION_MESSAGE_FIXED_LENGTH: string = "$property: debe tener $constraint1 caracteres.";
    public static readonly VALIDATION_MESSAGE_IS_NOT_EMPTY: string = "$property no debe estar vacío";

    public static readonly MESSAGE_RESPONSE_LOGIN : string = "Ha iniciado sesión satisfactoriamente.";
    public static readonly MESSAGE_RESPONSE_REGISTER: string = "Usuario registrado satisfactoriamente.";

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

    public static readonly TEST_STATE_NOT_EXECUTED = 1;
    public static readonly TEST_STATE_PASSED = 2;
    public static readonly TEST_STATE_FAILED = 3;
    public static readonly TEST_STATE_SKIPPED = 4;
    public static readonly TEST_STATE_BROKEN = 5;

    public static readonly USER_ROLE_ADMIN = "Admin";
    public static readonly USER_ROLE_TESTER= "Tester";

    //#endregion
}