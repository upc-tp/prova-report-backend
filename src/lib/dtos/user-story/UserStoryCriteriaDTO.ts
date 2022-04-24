import { IsInt, IsOptional, IsString } from "class-validator";
import { ProvaConstants } from "../../common/constants";

export class UserStoryCriteriaDTO {

    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    @IsOptional()
    id: number;

    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    @IsOptional()
    testCaseId: number;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    description: string;
}