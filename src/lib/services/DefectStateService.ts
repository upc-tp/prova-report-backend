import { container, singleton } from "tsyringe";
import { DatabaseManager } from "../database/DatabaseManager";
import { DefectState } from "../models/DefectState.entity";
import { DefectStateRepository } from "../repositories/DefectStateRepository";

@singleton()
export class DefectStateService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getAll(): Promise<[DefectState[], number]> {
        try {
            const conn = await this._database.getConnection();
            const defectStateRepo = conn.getCustomRepository(DefectStateRepository);
            const result = await defectStateRepo.findAndCount();
            return result;
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }
}