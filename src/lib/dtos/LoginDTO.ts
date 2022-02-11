import { IsString } from "class-validator";
import { ProvaConstants } from "../common/constants";

export class LoginDTO {
    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    email: string;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    password: string;
}