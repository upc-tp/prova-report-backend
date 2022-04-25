DROP TRIGGER IF EXISTS tg_user_stories_before_insert;

DELIMITER $$

CREATE TRIGGER tg_user_stories_before_insert
    BEFORE INSERT
    ON user_stories
    FOR EACH ROW
BEGIN
	DECLARE new_tag int;
	DECLARE last_tag int;
	DECLARE prj_id int;
	IF NEW.tag IS NULL THEN
		SET last_tag := (SELECT last_user_story FROM projects as p WHERE p.id = NEW.project_id);
		SET new_tag := last_tag + 1;
		
        UPDATE projects
        SET last_user_story=new_tag
        WHERE id = NEW.project_id;
        
        SET NEW.tag = CONCAT("US-",LPAD(CONVERT(new_tag, char), 2, "0"));
	END IF;
END$$

DELIMITER ;