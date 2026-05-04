import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, COUNT(a.application_id) as application_count 
            FROM students s 
            LEFT JOIN applications a ON s.student_id = a.student_id 
            GROUP BY s.student_id
        `);
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, branch, cgpa, email } = body;
        
        // Calling the provided stored procedure
        await pool.query('CALL add_student(?, ?, ?, ?)', [name, branch, cgpa, email]);
        
        return NextResponse.json({ message: 'Student created successfully' }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
    }
}
