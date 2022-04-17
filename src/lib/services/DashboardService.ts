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

            const severities = await conn.query(`SELECT s.id, s.name,
            (SELECT COUNT(*) 
            FROM test_executions te
            INNER JOIN test_cases tc
            ON tc.id = te.test_case_id
            and te.order = tc.last_execution
            INNER JOIN test_suites tst
            ON tst.id = tc.test_suite_id 
            WHERE tc.severity_id = s.id
            and tst.project_id = ${mysql.escape(projectId)}) as num_tests
            FROM severities s;`);

            const testsBySeverity = await Promise.all(severities.map(async (s) => {
                s['statuses'] = await conn.query(`SELECT t.id, t.name,
                (SELECT COUNT(*)
                FROM test_executions te
                INNER JOIN test_cases tc
                ON tc.id = te.test_case_id
                and te.order = tc.last_execution
                INNER JOIN test_suites tst
                ON tst.id = tc.test_suite_id 
                WHERE tst.project_id = ${mysql.escape(projectId)}
                and tc.severity_id = ${mysql.escape(s.id)}
                and te.test_state_id = t.id
                ) as num_tests
                from test_states t;`);
                return s;
            }));

            const priorities = await conn.query(`SELECT p.id, p.name,
            (SELECT COUNT(*) 
            FROM test_executions te
            INNER JOIN test_cases tc
            ON tc.id = te.test_case_id
            and te.order = tc.last_execution
            INNER JOIN test_suites tst
            ON tst.id = tc.test_suite_id
            WHERE tc.priority_id = p.id
            and tst.project_id = ${mysql.escape(projectId)}) as num_tests
            FROM priorities as p;`);

            const testsByPriority = await Promise.all(priorities.map(async (p) => {
                p['statuses'] = await conn.query(`SELECT t.id, t.name,
                (SELECT COUNT(*)
                FROM test_executions te
                INNER JOIN test_cases tc
                ON tc.id = te.test_case_id
                and te.order = tc.last_execution
                INNER JOIN test_suites tst
                ON tst.id = tc.test_suite_id 
                WHERE tst.project_id = ${mysql.escape(projectId)}
                and tc.priority_id = ${mysql.escape(p.id)}
                and te.test_state_id = t.id
                ) as num_tests
                from test_states t;`);
                return p;
            }));

            const defectsByStatus = await conn.query(`SELECT ds.id, ds.name,
            (SELECT COUNT(*) FROM defects d
            INNER JOIN test_cases tc
            ON tc.id = d.test_case_id
            INNER JOIN test_suites tst
            ON tst.id = tc.test_suite_id
            WHERE tst.project_id = ${mysql.escape(projectId)}
            and d.defect_state_id = ds.id) as num_defects 
            FROM defect_states ds;`);

            return {
                testsByStatus,
                defectsByStatus,
                testsBySeverity,
                testsByPriority
            };
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }
}