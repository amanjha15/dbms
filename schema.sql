CREATE DATABASE IF NOT EXISTS placement_portal2;
USE placement_portal2;

CREATE TABLE IF NOT EXISTS students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    cgpa DECIMAL(3,2) CHECK (cgpa BETWEEN 0 AND 10),
    skills TEXT,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE,
    placement_status VARCHAR(20) DEFAULT 'NOT PLACED',
    CHECK (placement_status IN ('NOT PLACED', 'PLACED'))
);

CREATE TABLE IF NOT EXISTS companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    role VARCHAR(100) NOT NULL,
    package DECIMAL(8,2),
    deadline DATE NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS eligibility (
    eligibility_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT,
    min_cgpa DECIMAL(3,2) DEFAULT 6.00,
    required_branch VARCHAR(50),
    required_skills TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    job_id INT,
    status VARCHAR(20) DEFAULT 'APPLIED',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
    ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id)
    ON DELETE CASCADE,
    UNIQUE(student_id, job_id),
    CHECK (status IN ('APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'))
);

CREATE TABLE IF NOT EXISTS placement_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNIQUE,
    job_id INT,
    final_status VARCHAR(20),
    salary DECIMAL(8,2),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (job_id) REFERENCES jobs(job_id)
);

CREATE TABLE IF NOT EXISTS admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS add_student(
    IN s_name VARCHAR(100),
    IN s_branch VARCHAR(50),
    IN s_cgpa DECIMAL(3,2),
    IN s_email VARCHAR(100)
)
BEGIN
    INSERT INTO students(name, branch, cgpa, email)
    VALUES (s_name, s_branch, s_cgpa, s_email);
END $$
DELIMITER ;

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS add_job(
    IN c_id INT,
    IN j_role VARCHAR(100),
    IN j_package DECIMAL(8,2),
    IN j_deadline DATE
)
BEGIN
    INSERT INTO jobs(company_id, role, package, deadline)
    VALUES (c_id, j_role, j_package, j_deadline);
END $$

DELIMITER ;

DELIMITER $$

CREATE FUNCTION IF NOT EXISTS check_eligibility(s_id INT, j_id INT)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE student_cgpa DECIMAL(3,2);
    DECLARE required_cgpa DECIMAL(3,2);
    DECLARE student_branch VARCHAR(50);
    DECLARE required_branch VARCHAR(50);
    DECLARE student_skills TEXT;
    DECLARE required_skills TEXT;

    SELECT cgpa, branch, skills 
    INTO student_cgpa, student_branch, student_skills
    FROM students 
    WHERE student_id = s_id;

    SELECT min_cgpa, required_branch, required_skills 
    INTO required_cgpa, required_branch, required_skills
    FROM eligibility 
    WHERE job_id = j_id;

    IF student_cgpa >= required_cgpa 
       AND student_branch = required_branch
       AND student_skills LIKE CONCAT('%', required_skills, '%')
    THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS apply_job(IN s_id INT, IN j_id INT)
BEGIN
    IF check_eligibility(s_id, j_id) THEN
        INSERT INTO applications(student_id, job_id)
        VALUES (s_id, j_id);
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student not eligible!';
    END IF;
END $$

DELIMITER ;

DELIMITER $$
CREATE TRIGGER prevent_multiple_placement
BEFORE INSERT ON placement_results
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 FROM placement_results
        WHERE student_id = NEW.student_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student already placed!';
    END IF;
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER update_student_status
AFTER INSERT ON placement_results
FOR EACH ROW
BEGIN
    UPDATE students
    SET placement_status = 'PLACED'
    WHERE student_id = NEW.student_id;
END $$

DELIMITER ;

-- views
CREATE OR REPLACE VIEW eligible_students AS
SELECT s.name, j.role, j.package
FROM students s
JOIN eligibility e ON s.cgpa >= e.min_cgpa
JOIN jobs j ON j.job_id = e.job_id
WHERE s.branch = e.required_branch;

CREATE OR REPLACE VIEW placed_students AS
SELECT s.name, c.company_name, j.role, pr.salary
FROM placement_results pr
JOIN students s ON s.student_id = pr.student_id
JOIN jobs j ON j.job_id = pr.job_id
JOIN companies c ON c.company_id = j.company_id;

-- indexes
CREATE INDEX idx_students_cgpa ON students(cgpa);
CREATE INDEX idx_students_branch ON students(branch);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_jobs_company ON jobs(company_id);

