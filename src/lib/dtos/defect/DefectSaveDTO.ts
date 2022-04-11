import { IsInt, IsOptional, IsString } from "class-validator";
import internal from "stream";
import { ProvaConstants } from "../../common/constants";

export class DefectSaveDTO {

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
    
    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    testCaseId: number;
    
    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    @IsOptional()
    testExecutionId: number;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    title: string;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    repro_steps: string;

    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    @IsOptional()
    is_fixed: number;
}