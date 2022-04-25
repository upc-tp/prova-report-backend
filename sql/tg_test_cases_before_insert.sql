DROP TRIGGER IF EXISTS tg_test_cases_before_insert;

DELIMITER $$

CREATE TRIGGER tg_test_cases_before_insert
    BEFORE INSERT
    ON test_cases
    FOR EACH ROW
BEGIN
    DECLARE new_tag int;
    DECLARE last_tag int;
    DECLARE prj_id int;
    IF NEW.tag IS NULL THEN
		SET prj_id := (SELECT project_id FROM test_suites as ts WHERE ts.id = NEW.test_suite_id);
		
		SET last_tag := (SELECT last_test_case FROM projects as p WHERE p.id = prj_id);
		SET new_tag := last_tag + 1;
		
        UPDATE projects
        SET last_test_case = new_tag
        WHERE id = prj_id;
        
        SET NEW.tag = CONCAT("TC-",LPAD(CONVERT(new_tag, char), 2, "0"));
	END IF;
END$$

DELIMITER ;