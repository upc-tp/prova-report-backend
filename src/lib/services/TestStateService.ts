import { container, singleton } from "tsyringe";
import { DatabaseManager } from "../database/DatabaseManager";
import { TestState } from "../models/TestState.entity";
import { TestStateRepository } from "../repositories/TestStateRepository";

@singleton()
export class TestStateService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getAll(): Promise<[TestState[], number]> {
        try {
            const conn = await this._database.getConnection();
            const testStateRepo = conn.getCustomRepository(TestStateRepository);
            const result = await testStateRepo.findAndCount();
            return result;
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }
}