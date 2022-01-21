import { IsInt, IsString } from "class-validator";
import { ProvaConstants } from "../common/constants";

export class TestCaseSaveDTO {

    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    testSuiteId: number;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    title: string;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    description: string;
}