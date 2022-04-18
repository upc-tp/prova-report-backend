import { IsArray, IsInt, IsOptional, IsString } from "class-validator";
import { ProvaConstants } from "../../common/constants";
import { UserStoryCriteria } from "../../models/UserStoryCriteria.entity";

export class UserStorySaveDTO {

    @IsInt({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_INT
    })
    projectId: number;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    name: string;

    @IsString({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_STRING
    })
    description: string;

    @IsArray({
        message: ProvaConstants.VALIDATION_MESSAGE_IS_ARRAY 
    })
    userStoryCriterias: UserStoryCriteria[]; 

}
