import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Attendance } from "@/lib/models/attendance"
import "@/lib/models/student" // 👈 make sure it's registered
import "@/lib/models/course"
import "@/lib/models/class"
import mongoose from "mongoose"

// GET all attendance records
export async function GET() {
  try {
    await connectDB()

    const records = await Attendance.find()
      .populate("studentId", "name studentId")
      .populate("classId", "semester type")
      .populate("courseId", "courseName")
      .sort({ createdAt: -1 })

    return NextResponse.json(records, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST new attendance
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()

    const { studentId, classId, courseId, isPresent, date } = body

    if (!studentId || !classId || !courseId || isPresent === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const attendance = await Attendance.create({
      studentId,
      classId,
      courseId,
      isPresent,
      date,
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
