SELECT s.id, s.name,
(SELECT COUNT(*)
FROM defects as d
INNER JOIN test_cases as tc
ON tc.id = d.test_case_id
INNER JOIN test_suites tst
ON tst.id = tc.test_suite_id
WHERE tst.project_id = 41
and d.severity_id = s.id
and tst.test_plan_id = 12
) as num_defects
from severities s;