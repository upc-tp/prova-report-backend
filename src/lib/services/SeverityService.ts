import { container, singleton } from "tsyringe";
import { DatabaseManager } from "../database/DatabaseManager";
import { Severity } from "../models/Severity.entity";
import { SeverityRepository } from "../repositories/SeverityRepository";

@singleton()
export class SeverityService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getAll(): Promise<[Severity[], number]> {
        try {
            const conn = await this._database.getConnection();
            const severityRepo = conn.getCustomRepository(SeverityRepository);
            const result = await severityRepo.findAndCount();
            return result;
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }
}