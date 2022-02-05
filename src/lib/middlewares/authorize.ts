import { NextFunction, Request, Response } from "express";
import { BusinessError } from "../common/business-error";

export function authorize(roles: string[]) {
    return function (req: Request, res: Response, next: NextFunction) {
        try {
            const user = req['user'];
            console.log('Datos de usuario: ', user);
            if (roles.includes(user.role)) {
                next();
            } else {
                throw new BusinessError("Lo sentimos, no está autorizado para realizar la operación solicitada.", 403);
            }
        } catch (error) {
            next(error);
        }
    };
}