import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Faculty from "@/lib/models/faculty"
import { Types } from "mongoose"

// PUT /api/faculty/:id - Update a faculty
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid faculty ID" }, { status: 400 })
    }

    const body = await request.json()

    const updated = await Faculty.findByIdAndUpdate(id, { name: body.name }, { new: true })
    if (!updated) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/faculty/:id - Delete a faculty
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid faculty ID" }, { status: 400 })
    }

    const deleted = await Faculty.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Faculty deleted successfully" }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
