import { IsString } from "class-validator";
import { ProvaConstants } from "../common/constants";


export class ProjectSaveDTO {
    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    title: string;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    description: string;
}