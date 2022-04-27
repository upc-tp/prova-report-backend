SELECT 
IFNULL(SUM(IF(d.is_fixed = 1, 1, 0)), 0) as fixed_defects, 
COUNT(d.id) as accepted_tests 
FROM defects d
INNER JOIN test_cases tc
ON tc.id = d.test_case_id
INNER JOIN test_suites tst
ON tst.id = tc.test_suite_id
WHERE tst.project_id = 41
and tst.test_plan_id = 12
and d.defect_state_id = 2;