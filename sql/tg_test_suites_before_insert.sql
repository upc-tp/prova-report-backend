DROP TRIGGER IF EXISTS tg_test_suite_before_insert;

DELIMITER $$

CREATE TRIGGER tg_test_suite_before_insert
    BEFORE INSERT
    ON test_suites
    FOR EACH ROW
BEGIN
    DECLARE new_tag int;
    DECLARE last_tag int;
    IF NEW.tag IS NULL THEN
		SET last_tag := (SELECT last_test_suite FROM projects as p WHERE p.id = NEW.project_id);
		SET new_tag := last_tag + 1;
        
        UPDATE projects
        SET last_test_suite = new_tag
        WHERE id = NEW.project_id;
        
        SET NEW.tag = CONCAT("TS-",LPAD(CONVERT(new_tag, char), 2, "0"));
	END IF;
END$$

DELIMITER ;