import {IsInt, IsString} from "class-validator";
import {ProvaConstants} from "../../common/constants";

export class SprintSaveDTO{
    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    projectId: number;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    description: string;
}
