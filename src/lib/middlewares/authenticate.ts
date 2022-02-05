import { Request, Response, NextFunction } from "express";
import jwt = require('jsonwebtoken');
import { BusinessError } from "../common/business-error";

export async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const userPayload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                req['user'] = userPayload;
                next();
            } catch (error) {
                throw new BusinessError('Lo sentimos, su sesión ha expirado. Vuelva a ingresar.', 403);
            }
        } else {
            throw new BusinessError('El servidor no pudo validar su identidad, por favor vuelva a iniciar sesión.', 401);
        }
    } catch (error) {
        next(error);
    }
}