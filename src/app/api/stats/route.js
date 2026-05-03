import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [studentCount] = await pool.query('SELECT COUNT(*) as total FROM students');
    const [companyCount] = await pool.query('SELECT COUNT(*) as total FROM companies');
    const [placedCount] = await pool.query("SELECT COUNT(*) as total FROM students WHERE placement_status = 'PLACED'");
    
    // Using IFNULL to handle case where there are no results yet
    const [salaryStats] = await pool.query('SELECT IFNULL(AVG(salary), 0) as avgSalary FROM placement_results');

    const [salaries] = await pool.query('SELECT salary FROM placement_results WHERE salary IS NOT NULL ORDER BY salary ASC');
    
    let medianSalary = 0;
    if (salaries.length > 0) {
      const mid = Math.floor(salaries.length / 2);
      if (salaries.length % 2 === 0) {
        medianSalary = (Number(salaries[mid - 1].salary) + Number(salaries[mid].salary)) / 2;
      } else {
        medianSalary = Number(salaries[mid].salary);
      }
    }

    const totalStudents = studentCount[0].total;
    const placed = placedCount[0].total;
    const placementRate = totalStudents > 0 ? Math.round((placed / totalStudents) * 100) : 0;
    
    return NextResponse.json({
      totalStudents,
      totalCompanies: companyCount[0].total,
      placedStudents: placed,
      placementRate: `${placementRate}%`,
      avgSalary: `₹${Math.round(Number(salaryStats[0].avgSalary)).toLocaleString('en-IN')}`,
      medianSalary: `₹${Math.round(medianSalary).toLocaleString('en-IN')}`
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
