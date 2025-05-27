// app/api/stats/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Student from '@/lib/models/student';
import Department from '@/lib/models/department';
import Course from '@/lib/models/course';

export async function GET() {
  try {
    await connectToDatabase();

    const [students,  departments, courses] = await Promise.all([
      Student.countDocuments(),
      Department.countDocuments(),
      Course.countDocuments(),
    ]);

    return NextResponse.json({
      totalStudents: students,
      totalFaculty: 0,
      totalDepartments: departments,
      totalCourses: courses,
    });
  } catch (err) {
    console.error('Stats Error:', err);
    return NextResponse.json({ error: 'Failed to fetch totals' }, { status: 500 });
  }
}
