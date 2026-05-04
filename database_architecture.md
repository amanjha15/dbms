# Placement Portal Database Architecture

This document breaks down the entire structure of your MySQL database (`placement_portal2`). It's designed to be robust, automatically enforcing rules so bad data can't enter your system.

## 1. Core Tables (The Data)

> [!NOTE]
> All tables use `ON DELETE CASCADE` where appropriate, meaning if you delete a Company, all their Jobs and Applications are automatically deleted so you don't have broken records.

*   **`students`**: Stores student profiles (Name, Branch, CGPA, Skills, Contact). Crucially, it has a `placement_status` column that defaults to 'NOT PLACED'.
*   **`companies`**: A simple table ensuring each company name is unique.
*   **`jobs`**: The actual job postings. Links to the `companies` table via `company_id`.
*   **`eligibility`**: The rules for each job. Links to `jobs` and defines the `min_cgpa`, `required_branch`, and `required_skills`.
*   **`applications`**: Tracks which student applied to which job. It has a `UNIQUE(student_id, job_id)` constraint so a student can't apply to the same job twice.
*   **`placement_results`**: The final success stories. Tracks who got placed, where, and for how much. `student_id` is unique here so a student can't be placed multiple times.
*   **`admin`**: Stores login credentials for the dashboard.

---

## 2. Functions & Procedures (The Logic)

Instead of relying solely on JavaScript to do the math, your database handles business logic directly.

*   **Function: `check_eligibility(s_id, j_id)`**
    *   **What it does:** Looks at a student's profile and compares it against a job's requirements.
    *   **How it works:** It returns `TRUE` *only* if the student's CGPA is $\geq$ the required CGPA, their branch matches exactly, and their skills contain the required skills.
*   **Procedure: `apply_job(s_id, j_id)`**
    *   **What it does:** The official way a student applies for a job.
    *   **How it works:** It first runs `check_eligibility`. If it returns true, it inserts the application. If it returns false, it blocks the application and throws a `'Student not eligible!'` error.
*   **Procedures: `add_student` & `add_job`**
    *   Helper scripts to quickly insert new records without writing full `INSERT INTO` queries every time.

---

## 3. Triggers (The Automation)

Triggers are invisible scripts that fire automatically when something happens. They are the "guardrails" of your database.

> [!IMPORTANT]
> Because these are handled at the database level, it is physically impossible to bypass them, even if there's a bug in your Next.js code!

*   **`prevent_multiple_placement` (BEFORE INSERT on `placement_results`)**
    *   **What it does:** Right *before* a new placement is recorded, it checks if that student already exists in the `placement_results` table.
    *   **Result:** If they are already placed, it entirely aborts the save process and throws an error: `Student already placed!`.
*   **`update_student_status` (AFTER INSERT on `placement_results`)**
    *   **What it does:** Right *after* a placement is successfully recorded, it reaches back into the `students` table.
    *   **Result:** It automatically flips that specific student's `placement_status` from `'NOT PLACED'` to `'PLACED'`.

---

## 4. Views & Indexes (The Optimizations)

*   **Views (`eligible_students`, `placed_students`)**: Think of these as "saved searches". Instead of writing massive `JOIN` queries across 4 tables every time you want to see who got placed, you can just `SELECT * FROM placed_students`. The database handles the complex joining in the background.
*   **Indexes (`idx_students_cgpa`, etc.)**: Like an index at the back of a textbook. Because your portal will filter by CGPA and Branch heavily, these indexes tell MySQL exactly where to look on the hard drive, making filtering infinitely faster than scanning every single row one by one.
