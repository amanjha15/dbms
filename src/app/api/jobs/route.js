import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const [rows] = await pool.query(`
            SELECT j.job_id, c.company_name, j.role, j.package, j.deadline, 
                   e.min_cgpa, e.required_branch
            FROM jobs j
            JOIN companies c ON j.company_id = c.company_id
            LEFT JOIN eligibility e ON j.job_id = e.job_id
            ORDER BY j.deadline DESC
        `);
        return NextResponse.json(rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { company_id, role, package: j_package, deadline } = body;
        
        await pool.query(
            'INSERT INTO jobs (company_id, role, package, deadline) VALUES (?, ?, ?, ?)',
            [company_id, role, j_package, deadline]
        );
        return NextResponse.json({ message: 'Job created successfully' }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }
}
