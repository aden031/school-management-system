import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import ExamTypeModel from "@/lib/models/examType"

/**
 * GET /api/exam-types - Get all exam types
 */
export async function GET() {
  try {
    await connectDB()
    const exams = await ExamTypeModel.find().sort({ createdAt: -1 })
    return NextResponse.json(exams, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/exam-types - Create a new exam type
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    const { name, marks, description } = body

    if (!name || !marks) {
      return NextResponse.json(
        { error: "Name and marks are required" },
        { status: 400 }
      )
    }

    if (!['mid term', 'final', 'quiz'].includes(name)) {
      return NextResponse.json(
        { error: "Invalid exam type name" },
        { status: 400 }
      )
    }

    const newExamType = await ExamTypeModel.create({ name, marks, description })
    return NextResponse.json(newExamType, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
