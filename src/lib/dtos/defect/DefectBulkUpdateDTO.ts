import { IsArray, IsInt, IsOptional, IsString } from "class-validator";
import internal from "stream";
import { ProvaConstants } from "../../common/constants";

export class DefectBulkUpdateDTO {

    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    defectStateId: number;

    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    @IsOptional()
    is_fixed: number;

    @IsArray({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_ARRAY 
    })
    defectIds: number[];
}