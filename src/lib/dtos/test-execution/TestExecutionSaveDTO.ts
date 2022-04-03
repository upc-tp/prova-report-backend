import { IsDate, IsInt, IsString } from "class-validator";
import { ProvaConstants } from "../../common/constants";

export class TestExecutionSaveDTO {
    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    testCaseId: number;

    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    order: number;
    
    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    duration: number;

    @IsDate({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_DATE_STRING
    })
    startTime: Date;

    @IsDate({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_DATE_STRING
    })
    endTime: Date;
}