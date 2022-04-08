import { container, singleton } from "tsyringe";
import { DatabaseManager } from "../database/DatabaseManager";
import mysql = require('mysql');

@singleton()
export class DashboardService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getDataByProject(projectId: number): Promise<any> {
        try {
            const conn = await this._database.getConnection();
            const testsByStatus = await conn.query(`SELECT ts.id,
            ts.name,
            (SELECT COUNT(*) 
            FROM test_executions te
            INNER JOIN test_cases tc
            ON tc.id = te.test_case_id
            and te.order = tc.last_execution
            INNER JOIN test_suites tst
            ON tst.id = tc.test_suite_id 
            WHERE te.test_state_id = ts.id
            and tst.project_id = ${mysql.escape(projectId)})
            as num_tests
            FROM test_states as ts;`);

            const testsBySeverity = await conn.query(`SELECT s.id, s.name,
            (SELECT COUNT(*) 
            FROM test_executions te
            INNER JOIN test_cases tc
            ON tc.id = te.test_case_id
            and te.order = tc.last_execution
            INNER JOIN test_suites tst
            ON tst.id = tc.test_suite_id 
            WHERE tc.severity_id = s.id
            and tst.project_id = ${mysql.escape(projectId)}) as num_test
            FROM severities s;`);

            return {
                testsBySeverity,
                testsByStatus
            };
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }
}