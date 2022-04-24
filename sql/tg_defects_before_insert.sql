DROP TRIGGER IF EXISTS tg_defects_before_insert;

DELIMITER $$

CREATE TRIGGER tg_defects_before_insert
    BEFORE INSERT
    ON defects
    FOR EACH ROW
BEGIN
    DECLARE new_tag int;
    DECLARE last_tag int;
    DECLARE prj_id int;
    IF NEW.tag IS NULL THEN
		SET prj_id := (SELECT ts.project_id 
        FROM test_suites as ts
        INNER JOIN test_cases as tc
        ON ts.id = tc.test_suite_id
        WHERE tc.id = NEW.test_case_id);
		
		SET last_tag := (SELECT last_defect FROM projects as p WHERE p.id = prj_id);
		SET new_tag := last_tag + 1;
		
		UPDATE projects
        SET last_defect = new_tag
        WHERE id = prj_id;
        
        SET NEW.tag = CONCAT("DT-",LPAD(CONVERT(new_tag, char), 2, "0"));
	END IF;
END$$

DELIMITER ;