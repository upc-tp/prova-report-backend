import { IsString } from "class-validator";
import { ProvaConstants } from "../common/constants";

export class ResetPasswordDTO {

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    password: string;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    newPassword: string;
}