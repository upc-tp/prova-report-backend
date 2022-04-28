import { IsInt, IsOptional, IsString } from "class-validator";
import { ProvaConstants } from "../../common/constants";

export class TestSuiteSaveDTO {

    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    projectId: number;

    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    @IsOptional()
    testPlanId: number;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    title: string;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    description: string;
}
