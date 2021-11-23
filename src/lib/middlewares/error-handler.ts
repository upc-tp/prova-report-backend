import { NextFunction, Request, Response } from "express";
import { BusinessError } from "../common/business-error";
import { SingleResponse } from "../common/responses";
import { ValidationError } from 'class-validator';

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error(err);
    let code: number = 500;
    let response: any;
    if (err instanceof BusinessError) {
        code = err.code;
        response = SingleResponse(err.message, false);
    } else if (err instanceof Array && err[0] instanceof ValidationError) {
        code = 400;
        let message: string = "";
        err.forEach(validationError => {
            for (const validationMessage of Object.values(validationError.constraints)) {
                message = message.concat(`${validationMessage}\n`);
            }
        });
        response = SingleResponse(message, false);
    } else {
        response = SingleResponse(err.message, false);
    }
    res.status(code).send(response);
}