import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import connectDB from "@/lib/db"
import ExamTypeModel from "@/lib/models/examType"

/**
 * GET /api/exam-types/:id - Get one exam type
 */
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid exam type ID" }, { status: 400 })
    }

    const exam = await ExamTypeModel.findById(id)
    if (!exam) {
      return NextResponse.json({ error: "Exam type not found" }, { status: 404 })
    }

    return NextResponse.json(exam, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT /api/exam-types/:id - Update an exam type
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid exam type ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, marks, description } = body

    if (name && !['mid term', 'final', 'quiz'].includes(name)) {
      return NextResponse.json({ error: "Invalid exam type name" }, { status: 400 })
    }

    const updated = await ExamTypeModel.findByIdAndUpdate(
      id,
      { name, marks, description },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json({ error: "Exam type not found" }, { status: 404 })
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/exam-types/:id - Delete an exam type
 */
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid exam type ID" }, { status: 400 })
    }

    const deleted = await ExamTypeModel.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: "Exam type not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Exam type deleted successfully" }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
