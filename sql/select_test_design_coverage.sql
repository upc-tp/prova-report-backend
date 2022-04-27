SELECT 
IFNULL(SUM(IF(usc.id > 0, 1, 0)), 0) as assigned_tests,
COUNT(tc.id) as total_tests
FROM test_cases tc
INNER JOIN test_suites tst
ON tst.id = tc.test_suite_id
LEFT JOIN user_story_criterias usc
ON usc.test_case_id = tc.id
LEFT JOIN test_plans tp
ON tp.id = tst.test_plan_id
WHERE tst.project_id = 41
AND tp.id = 12;