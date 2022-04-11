import { IsInt, IsOptional, IsString } from "class-validator";
import internal from "stream";
import { ProvaConstants } from "../../common/constants";

export class DefectUpdateDTO {

    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    @IsOptional()
    defectStateId: number;

    
    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    priorityId: number;
    
    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    severityId: number;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    @IsOptional()
    title: string;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    @IsOptional()
    repro_steps: string;

    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    @IsOptional()
    is_fixed: number;
}