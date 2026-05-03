import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM placed_students');
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { student_id, job_id, salary } = body;
        
        await pool.query(
            'INSERT INTO placement_results (student_id, job_id, final_status, salary) VALUES (?, ?, ?, ?)',
            [student_id, job_id, 'PLACED', salary]
        );
        return NextResponse.json({ message: 'Placement recorded successfully' }, { status: 201 });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlState === '45000') {
            return NextResponse.json({ error: error.message || 'Student already placed!' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to record placement' }, { status: 500 });
    }
}
