import { container, singleton } from "tsyringe";
import { DatabaseManager } from "../database/DatabaseManager";
import mysql = require('mysql');

@singleton()
export class DashboardService {
    _database: DatabaseManager;

    constructor() {
        this._database = container.resolve(DatabaseManager);
    }

    async getData(projectId: number, testPlanId: number = 0): Promise<any> {
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
            and tst.project_id = ${mysql.escape(projectId)}
            ${testPlanId > 0 ? 'and tst.test_plan_id=' + testPlanId: ''}
            ) as num_tests
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
            and tst.project_id = ${mysql.escape(projectId)}
            ${testPlanId > 0 ? 'and tst.test_plan_id=' + testPlanId: ''}
            ) as num_tests
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
                ${testPlanId > 0 ? 'and tst.test_plan_id=' + testPlanId: ''}
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
            and tst.project_id = ${mysql.escape(projectId)}
            ${testPlanId > 0 ? 'and tst.test_plan_id=' + testPlanId: ''}
            ) as num_tests
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
                ${testPlanId > 0 ? 'and tst.test_plan_id=' + testPlanId: ''}
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
            and d.defect_state_id = ds.id
            ${testPlanId > 0 ? 'and tst.test_plan_id=' + testPlanId: ''}
            ) as num_defects
            FROM defect_states ds;`);

            const queryRequirementCoverage = `SELECT us.id, us.tag, 
            COUNT(tc.id) as assigned_tests, 
            COUNT(te.id) as executed_tests 
            FROM user_stories as us
            INNER JOIN user_story_criterias usc
            ON usc.user_story_id = us.id
            INNER JOIN test_cases tc
            ON tc.id = usc.test_case_id
            INNER JOIN test_suites tst
            ON tst.id = tc.test_suite_id
            INNER JOIN projects p
            ON p.id = tst.project_id
            LEFT JOIN test_executions te
            ON te.test_case_id = tc.id
            WHERE p.id = ${projectId}
            ${testPlanId > 0 ? 'AND us.test_plan_id=' + testPlanId: ''}
            GROUP BY us.id
            ORDER BY us.tag;`;
            let userStoryExecutedTests = await conn.query(queryRequirementCoverage);
            const coveredSerie = [];
            const uncoveredSerie = [];
            const categories = []
            for (const us of userStoryExecutedTests) {
                categories.push(us.tag);
                coveredSerie.push(+us.executed_tests);
                uncoveredSerie.push(us.assigned_tests - us.executed_tests);
            }
            const requirementCoverage = {
                categories,
                series: [
                    {
                        name: 'Historias cubiertas',
                        data: coveredSerie
                    },
                    {
                        name: 'Historias no cubiertas',
                        data: uncoveredSerie
                    }
                ],
                details: userStoryExecutedTests
            };

            const testCoverageQuery = `SELECT 
            IFNULL(SUM(IF(tc.last_execution > 0, 1, 0)), 0) as executed_tests,
            COUNT(tc.id) as total_tests
            FROM test_cases tc
            INNER JOIN test_suites tst
            ON tst.id = tc.test_suite_id
            LEFT JOIN test_plans tp
            ON tp.id = tst.test_plan_id
            WHERE tst.project_id = ${projectId}
            ${testPlanId > 0 ? 'AND tp.id=' + testPlanId: ''};`;

            const testCoverage = await conn.query(testCoverageQuery);

            const testDesignCoverageQuery = `SELECT 
            IFNULL(SUM(IF(usc.id > 0, 1, 0)), 0) as assigned_tests,
            COUNT(tc.id) as total_tests
            FROM test_cases tc
            INNER JOIN test_suites tst
            ON tst.id = tc.test_suite_id
            LEFT JOIN user_story_criterias usc
            ON usc.test_case_id = tc.id
            LEFT JOIN test_plans tp
            ON tp.id = tst.test_plan_id
            WHERE tst.project_id = ${projectId}
            ${testPlanId > 0 ? 'AND tp.id=' + testPlanId: ''};`;

            const testDesignCoverage = await conn.query(testDesignCoverageQuery);

            return {
                testsByStatus,
                defectsByStatus,
                testsBySeverity,
                testsByPriority,
                requirementCoverage,
                testCoverage: testCoverage[0],
                testDesignCoverage: testDesignCoverage[0]
            };
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }
}