// app/api/class/[id]/route.ts

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
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "Invalid class ID" }), { status: 400 });
    }

    // Get class details
    const classData = await mongoose.model<typeof Class>("Class").findById(id).lean();
    if (!classData) {
      return new Response(JSON.stringify({ error: "Class not found" }), { status: 404 });
    }

    // Get students in class
    const students = await Student.find({ classId: id })
      .select("_id studentId name phone parentPhone status")
      .lean();

    if (students.length === 0) {
      return new Response(JSON.stringify({
        class: classData,
        students: [],
        attendanceStats: { totalStudents: 0, averageAttendance: 0, presentToday: 0, absentToday: 0 },
        examStats: { averageMarks: 0, highestMarks: 0, lowestMarks: 0, passRate: 0 },
        feeStats: { totalFees: 0, collectedFees: 0, pendingFees: 0, defaulters: 0 }
      }), { status: 200 });
    }

    const studentIds = students.map(s => s._id);

    // Calculate dates for today's attendance
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Get attendance data
    const [attendanceData, examData, feeData] = await Promise.all([
      Attendance.find({ studentId: { $in: studentIds } }).lean(),
      Exam.find({ studentId: { $in: studentIds } }).lean(),
      Fee.find({ studentId: { $in: studentIds } }).lean()
    ]);

    // Attendance calculations
    const totalAttendanceRecords = attendanceData.length;
    const totalPresentRecords = attendanceData.filter(a => a.isPresent).length;
    const averageAttendance = totalAttendanceRecords > 0 
      ? Math.round((totalPresentRecords / totalAttendanceRecords) * 100)
      : 0;

    const todayAttendance = attendanceData.filter(a => 
      a.date >= todayStart && a.date <= todayEnd
    );
    const presentToday = todayAttendance.filter(a => a.isPresent).length;
    const absentToday = todayAttendance.length - presentToday;

    // Exam calculations
    const examMarks = examData.map(e => e.marksObtained);
    const averageMarks = examMarks.length > 0 
      ? Math.round(examMarks.reduce((a, b) => a + b, 0) / examMarks.length)
      : 0;
    const highestMarks = examMarks.length > 0 ? Math.max(...examMarks) : 0;
    const lowestMarks = examMarks.length > 0 ? Math.min(...examMarks) : 0;
    const passedExams = examData.filter(e => e.marksObtained >= 50).length;
    const passRate = examData.length > 0 
      ? Math.round((passedExams / examData.length) * 100)
      : 0;

    // Fee calculations
    const totalFees = feeData.reduce((sum, f) => sum + f.amount, 0);
    const collectedFees = feeData.reduce((sum, f) => sum + f.amountPaid, 0);
    const pendingFees = totalFees - collectedFees;
    const defaulters = feeData.filter(f => f.status === "unpaid").length;

    const responseData = {
      class: classData,
      students,
      attendanceStats: {
        totalStudents: students.length,
        averageAttendance,
        presentToday,
        absentToday
      },
      examStats: {
        averageMarks,
        highestMarks,
        lowestMarks,
        passRate
      },
      feeStats: {
        totalFees,
        collectedFees,
        pendingFees,
        defaulters
      }
    };

    return new Response(JSON.stringify(responseData), { status: 200 });

  } catch (error) {
    console.error("Error generating class report:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}