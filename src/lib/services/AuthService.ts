import bcrypt = require("bcrypt");
import jwt = require("jsonwebtoken");
import { container, singleton } from "tsyringe";
import { BusinessError } from "../common/business-error";
import { DatabaseManager } from "../database/DatabaseManager";
import { LoginDTO } from "../dtos/LoginDTO";
import { UserRepository } from "../repositories/UserRepository";

@singleton()
export class AuthService {
    _database: DatabaseManager;
    refreshTokens = [];

    constructor() {
        this._database = container.resolve(DatabaseManager);
        this.login = this.login.bind(this);
    }

    async login(dto: LoginDTO): Promise<any> {
        try {
            const conn = await this._database.getConnection();
            return await conn.transaction(async transactionalEntityManager => {
                const userRepo = transactionalEntityManager.getCustomRepository(UserRepository);
                const user = await userRepo.findOne({
                    where: {
                        email: dto.email
                    }
                });
                if(!user) {
                    throw new BusinessError('El email ingresado es incorrecto', 400);
                }

                const passwordDidMatch = await bcrypt.compare(dto.password, user.password);
                if (!passwordDidMatch) {
                    throw new BusinessError('La clave ingresada es incorrecta.', 400);
                }
                const payload = {
                    uid: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName
                };
                const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_EXPIRES_IN });
                const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
                this.refreshTokens.push(refreshToken);
                const response = {
                    accessToken,
                    refreshToken
                };
                return response;
            }).catch(error => {
                return Promise.reject(error);
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async generateAccessTokenFromRefreshToken(refreshToken: string): Promise<string> {
        try {
            if (!refreshToken) {
                throw new BusinessError('El servidor no pudo validar su identidad, por favor vuelva a iniciar sesión.', 401);
            }
            if (!this.refreshTokens.includes(refreshToken)) {
                throw new BusinessError('Lo sentimos, su sesión ha expirado. Vuelva a ingresar.', 403);
            }
            const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_EXPIRES_IN });
            return accessToken;
        } catch (error) {
            throw new BusinessError('Lo sentimos, su sesión ha expirado. Vuelva a ingresar.', 403);
        }
    }

    async logout(refreshToken: string) {
        this.refreshTokens = this.refreshTokens.filter(t => t != refreshToken);
    }

    async encode(data: string): Promise<string> {
        try {
            const saltRounds = +process.env.ACCESS_SALT_ROUNDS;
            const hashedData = bcrypt.hash(data, saltRounds);
            return hashedData;
        } catch (error) {
            return Promise.reject(error);
        }
    }
}