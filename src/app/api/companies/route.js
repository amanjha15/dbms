import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT company_id, company_name FROM companies ORDER BY company_name ASC');
        return NextResponse.json(rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { company_name } = body;
        
        await pool.query('INSERT INTO companies (company_name) VALUES (?)', [company_name]);
        return NextResponse.json({ message: 'Company added successfully' }, { status: 201 });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Company already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to add company' }, { status: 500 });
    }
}
