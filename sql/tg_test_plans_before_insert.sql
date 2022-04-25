DROP TRIGGER IF EXISTS tg_test_plans_before_insert;

DELIMITER $$

CREATE TRIGGER tg_test_plans_before_insert
    BEFORE INSERT
    ON test_plans
    FOR EACH ROW
BEGIN
    DECLARE new_tag int;
    DECLARE last_tag int;
    IF NEW.tag IS NULL THEN
		SET last_tag := (SELECT last_test_plan FROM projects as p WHERE p.id = NEW.project_id);
		SET new_tag := last_tag + 1;
		
		UPDATE projects
        SET last_test_plan = new_tag
        WHERE id = NEW.project_id;
        
        SET NEW.tag = CONCAT("TP-",LPAD(CONVERT(new_tag, char), 2, "0"));
	END IF;
END$$

DELIMITER ;