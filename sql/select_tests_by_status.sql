SELECT ts.id,
ts.name,
(SELECT COUNT(*) 
FROM test_cases tc
INNER JOIN test_suites tst
ON tst.id = tc.test_suite_id 
WHERE tc.test_state_id = ts.id
and tst.project_id = 41
) as num_tests
FROM test_states as ts;