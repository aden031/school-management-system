import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Exam } from '@/lib/models/exam';
import Student from '@/lib/models/student';

export async function POST(req: NextRequest) {
  try {
    const bulkExams = await req.json();

    // Validate input format
    if (!Array.isArray(bulkExams)) {
      return NextResponse.json({ message: 'Expected array of exam data' }, { status: 400 });
    }

    // Extract all student ID numbers from bulk data
    const studentIds = bulkExams.map((exam) => exam.studentId).filter(Boolean);

    // Get matching students
    const students = await Student.find({
      studentId: { $in: studentIds },
    });

    // Create mapping from studentId number to MongoDB _id
    const studentMap = new Map(
      students.map((student: any) => [student.studentId, student._id])
    );

    const examsToInsert = [];
    const errors = [];

    for (const [index, examData] of bulkExams.entries()) {
      const entryErrors: string[] = [];
      const studentIdNumber = examData.studentId;

      if (!studentIdNumber) {
        entryErrors.push('Missing studentId');
      }

      const studentId = studentMap.get(studentIdNumber);
      if (!studentId) {
        entryErrors.push(`Student not found: ${studentIdNumber}`);
      }

      let examTypeId;
      try {
        examTypeId = new mongoose.Types.ObjectId(examData.examTypeId);
      } catch {
        entryErrors.push('Invalid examTypeId');
      }

      let courseId;
      try {
        courseId = new mongoose.Types.ObjectId(examData.courseId);
      } catch {
        entryErrors.push('Invalid courseId');
      }

      const marksObtained = Number(examData.marksObtained);
      if (isNaN(marksObtained) || marksObtained < 0) {
        entryErrors.push('Invalid marks obtained');
      }

      if (entryErrors.length > 0) {
        errors.push({
          index,
          studentId: studentIdNumber,
          errors: entryErrors,
        });
      } else {
        examsToInsert.push({
          studentId,
          examTypeId,
          courseId,
          marksObtained,
        });
      }
    }

    let insertedCount = 0;
    if (examsToInsert.length > 0) {
      const result = await Exam.insertMany(examsToInsert);
      insertedCount = result.length;
    }

    const response = {
      message: 'Bulk upload processed',
      insertedCount,
      errorCount: errors.length,
      errors,
    };

    return NextResponse.json(response, { status: errors.length ? 207 : 201 });
  } catch (error: any) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
