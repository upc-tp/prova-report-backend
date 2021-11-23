"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const tsyringe_1 = require("tsyringe");
const typeorm_1 = require("typeorm");
const constants_1 = require("../common/constants");
/**
 * Database manager class
 */
let DatabaseManager = class DatabaseManager {
    constructor() {
        this.connectionManager = (0, typeorm_1.getConnectionManager)();
    }
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const CONNECTION_NAME = constants_1.ProvaConstants.CONNECTION_DEV_DEFAULT_NAME;
            let connection;
            if (this.connectionManager.has(CONNECTION_NAME)) {
                console.info(`Database.getConnection()-using existing connection ...`);
                connection = this.connectionManager.get(CONNECTION_NAME);
                if (!connection.isConnected) {
                    connection = yield connection.connect();
                }
            }
            else {
                console.info(`Database.getConnection()-creating new connection ...`);
                const connectionOptions = {
                    name: CONNECTION_NAME,
                    type: `mysql`,
                    port: process.env.MYSQL_PORT | 3306,
                    synchronize: false,
                    logging: [
                        "query"
                    ],
                    host: process.env.MYSQL_HOST,
                    username: process.env.MYSQL_USER,
                    database: process.env.MYSQL_DATABASE,
                    password: process.env.MYSQL_PASSWORD,
                    entities: [
                        __dirname + '/../**/*.entity.{js,ts}'
                    ],
                    extra: {
                        connectionLimit: 1
                    },
                    subscribers: [
                        __dirname + '/../**/AuditEntity.entity.{js,ts}'
                    ]
                };
                connection = yield (0, typeorm_1.createConnection)(connectionOptions);
            }
            return connection;
        });
    }
};
DatabaseManager = __decorate([
    (0, tsyringe_1.singleton)()
], DatabaseManager);
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=DatabaseManager.js.map