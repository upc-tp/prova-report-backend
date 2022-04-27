SELECT DATE(te.created_at) as day,
COUNT(te.id) as tests_executed_by_day,
AVG(te.duration) as average_duration
FROM test_executions te
INNER JOIN test_cases tc
ON tc.id = te.test_case_id and tc.last_execution = te.order 
INNER JOIN test_suites tst
ON tst.id = tc.test_suite_id
WHERE tst.project_id = 41
and tst.test_plan_id = 12
and (DATE(te.created_at) BETWEEN '2022-04-01' AND '2022-04-30')
GROUP BY DATE(te.created_at);