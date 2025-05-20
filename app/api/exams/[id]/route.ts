import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Exam } from "@/lib/models/exam"
import mongoose from "mongoose"

/**
 * GET /api/exams/:id - Fetch single exam with related info
 */
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 })
    }

    const exam = await Exam.findById(id)
      .populate("studentId", "name")
      .populate("examTypeId", "name")
      .populate("courseId", "name")

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json(exam, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT /api/exams/:id - Update an exam record
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const body = await request.json()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 })
    }

    const updatedExam = await Exam.findByIdAndUpdate(id, body, { new: true })
      .populate("studentId", "name")
      .populate("examTypeId", "name")
      .populate("courseId", "name")

    if (!updatedExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json(updatedExam, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/exams/:id - Delete an exam
 */
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 })
    }

    const deleted = await Exam.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Exam deleted successfully" }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
