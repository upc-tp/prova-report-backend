import { IsString } from "class-validator";
import { ProvaConstants } from "../../common/constants";

export class UserStoryCriteriaUpdateDTO {

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    description: string;
}