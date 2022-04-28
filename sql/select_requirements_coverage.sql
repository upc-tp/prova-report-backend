SELECT us.id, us.tag, 
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
WHERE p.id = 41
AND us.test_plan_id = 12
GROUP BY us.id
ORDER BY us.tag;