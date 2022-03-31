import {IsString} from "class-validator";
import {ProvaConstants} from "../../common/constants";

export class SprintUpdateDTO{
    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    description: string;
}
