// app/api/student/[id]/route.ts

import connectToDatabase from "@/lib/db";
import Student from "@/lib/models/student";
import { Attendance } from "@/lib/models/attendance";
import { Exam } from "@/lib/models/exam";
import { Fee } from "@/lib/models/fee";
import mongoose from "mongoose";
import Class from "@/lib/models/class";
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const { id } = params;

    // Build query conditions for valid ID types
    const orConditions = [];
    if (mongoose.Types.ObjectId.isValid(id)) {
      orConditions.push({ _id: id });
    }
    const numericId = Number(id);
    if (!isNaN(numericId)) {
      orConditions.push({ studentId: numericId });
    }
    if (orConditions.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid student ID" }), { status: 400 });
    }

    // Find student and populate class name
    const student = await Student.findOne({ $or: orConditions })
      .populate({ path: "classId", select: "classMode type semester" })
      .lean();

    if (!student) {
      return new Response(JSON.stringify({ error: "Student not found" }), { status: 404 });
    }

    // Fetch related data
    const [attendanceHistory, examHistory, feeHistory] = await Promise.all([
      Attendance.find({ studentId: student._id }).lean(),
      Exam.find({ studentId: student._id }).lean(),
      Fee.find({ studentId: student._id }).lean(),
    ]);

    // Calculate attendance stats
    const presentDays = attendanceHistory.filter((a) => a.isPresent).length;
    const totalDays = attendanceHistory.length;
    const absentDays = totalDays - presentDays;
    const percentage = totalDays ? Math.round((presentDays / totalDays) * 100) : 0;

    // Prepare response data
    const responseData = {
      student: {
        ...student,
        className: (student.classId as any).name, // Add class name from populated classId
      },
      attendanceHistory,
      examHistory,
      feeHistory,
      attendanceStats: {
        totalDays,
        presentDays,
        absentDays,
        percentage,
      },
    };

    return new Response(JSON.stringify(responseData), { status: 200 });
  } catch (error) {
    console.error("Error fetching student report:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}