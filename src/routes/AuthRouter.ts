import * as express from 'express';
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { ProvaConstants } from "../lib/common/constants";
import { ResultResponse, SingleResponse } from "../lib/common/responses";
import { LoginDTO } from '../lib/dtos/LoginDTO';
import { AuthService } from '../lib/services/AuthService';
import { RegisterDTO } from '../lib/dtos/RegisterDTO';
import { ResetPasswordDTO } from '../lib/dtos/ResetPasswordDTO';
import { authenticateJWT } from '../lib/middlewares/authenticate';
import { loginlimiter } from '../lib/middlewares/authorize';

const _authService = container.resolve(AuthService);
const router = express.Router();

router.post('/login', loginlimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto: LoginDTO = plainToClass(LoginDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _authService.login(dto);
        const message = ProvaConstants.MESSAGE_RESPONSE_LOGIN;
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto: RegisterDTO = plainToClass(RegisterDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }
        const result = await _authService.register(dto);
        const message = ProvaConstants.MESSAGE_RESPONSE_REGISTER;
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.post('/encode', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data } = req.body;
        const result = await _authService.encode(data);
        const message = ProvaConstants.MESSAGE_RESPONSE_GET_SUCCESS;
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.post('/token', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        const accessToken = await _authService.generateAccessTokenFromRefreshToken(refreshToken);
        const result = {
            accessToken
        };
        const message = ProvaConstants.MESSAGE_RESPONSE_LOGIN;
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        await _authService.logout(refreshToken);
        const message = 'Ha cerrado sesi??n satisfactoriamente';
        const response = SingleResponse(message, true, null);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});


router.put('/reset-password',authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto: ResetPasswordDTO = plainToClass(ResetPasswordDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors);
        }

        const result = await _authService.resetPassword(dto);
        const message = ProvaConstants.MESSAGE_RESPONSE_RESET_PASSWORD;
        const response = SingleResponse(message, true, result);
        res.status(200).send(response);
    } catch (error) {
        return next(error);
    }
});

export = router;