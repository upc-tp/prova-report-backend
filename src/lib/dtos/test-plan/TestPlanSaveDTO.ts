import { IsInt, IsOptional, IsString } from "class-validator";
import { ProvaConstants } from "../../common/constants";

export class TestPlanSaveDTO {

    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    projectId: number;

    @IsOptional()
    versionId: number;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    title: string;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    description: string;
}