import { NextFunction, Request, Response } from "express";
import { BusinessError } from "../common/business-error";
import { rateLimit } from "express-rate-limit";

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

export const loginlimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 10 minutes
	max: 5, // Limit each IP to 5 requests per `window` (here, per 10 minutes)
    message: {
        message: "Error de inicio de sesión, has alcanzado el número máximo de intentos. Intenta de nuevo en 15 minutos",
        success: false,
        result: null
    },
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})