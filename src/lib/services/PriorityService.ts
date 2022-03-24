import { container, singleton } from "tsyringe";
import { DatabaseManager } from "../database/DatabaseManager";
import { Priority } from "../models/Priority.entity";
import { PriorityRepository } from "../repositories/PriorityRepository";

@singleton()
export class PriorityService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getAll(): Promise<[Priority[], number]> {
        try {
            const conn = await this._database.getConnection();
            const priorityRepo = conn.getCustomRepository(PriorityRepository);
            const result = await priorityRepo.findAndCount();
            return result;
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }
}