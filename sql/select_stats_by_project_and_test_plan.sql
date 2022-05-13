SELECT 
COUNT(*) as total_stories 
FROM user_stories as us
where
project_id = 41 
and test_plan_id = 12;

SELECT COUNT(*) as covered_stories FROM 
(SELECT us.id, us.tag, us.name,
COUNT(usc.id) as criterias,
COUNT(te.id) as executions
FROM user_stories as us
left join user_story_criterias as usc
on usc.user_story_id = us.id
inner join test_cases as tc
on tc.id = usc.test_case_id
left join test_executions as te
on te.test_case_id = tc.id
where us.project_id = 41
and us.test_plan_id = 12
group by us.id, us.tag, us.name) as stories
where stories.criterias = stories.executions;

select COUNT(*) as total_tests from test_cases as tc
inner join test_suites as ts
on ts.id = tc.test_suite_id
where ts.project_id = 41
and ts.test_plan_id = 12;

select COUNT(*) as assigned_tests from test_cases as tc
inner join test_suites as ts
on ts.id = tc.test_suite_id
inner join user_story_criterias as usc
on usc.test_case_id = tc.id
where ts.project_id = 41
and ts.test_plan_id = 12;

select COUNT(*) as executed_tests from test_cases as tc
inner join test_suites as ts
on ts.id = tc.test_suite_id
inner join test_executions as te
on te.test_case_id = tc.id
where ts.project_id = 41
and ts.test_plan_id = 12;




