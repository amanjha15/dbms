import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { student_id, job_id } = body;
        
        // Call the apply_job procedure which checks eligibility
        await pool.query('CALL apply_job(?, ?)', [student_id, job_id]);
        
        return NextResponse.json({ message: 'Application submitted successfully' }, { status: 201 });
    } catch (error) {
        console.error(error);
        // Extract the error message from the SIGNAL SQLSTATE
        const errorMessage = error.sqlMessage || 'Failed to submit application. Ensure you are eligible.';
        return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
}

export async function GET(request) {
    // Optionally fetch applications by student_id passed as query parameter
    const { searchParams } = new URL(request.url);
    const student_id = searchParams.get('student_id');

    try {
        let query = `
            SELECT a.application_id, a.status, a.applied_at, j.role, c.company_name
            FROM applications a
            JOIN jobs j ON a.job_id = j.job_id
            JOIN companies c ON j.company_id = c.company_id
        `;
        const params = [];

        if (student_id) {
            query += ' WHERE a.student_id = ?';
            params.push(student_id);
        }

        const [rows] = await pool.query(query, params);
        return NextResponse.json(rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }
}
