import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Department from "@/lib/models/department"
import mongoose from "mongoose"

/**
 * GET /api/department/:id - Get a single department with faculty info
 */
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 })
    }

    const department = await Department.findById(id).populate("facultyId", "name")
    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    return NextResponse.json(department, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT /api/department/:id - Update a department
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, facultyId, studentCount } = body

    // Optional: validate facultyId if it's being changed
    if (facultyId && !mongoose.Types.ObjectId.isValid(facultyId)) {
      return NextResponse.json({ error: "Invalid faculty ID" }, { status: 400 })
    }


    const updated = await Department.findByIdAndUpdate(
      id,
      { name, facultyId,  studentCount },
      { new: true }
    ).populate("facultyId", "name")

    if (!updated) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/department/:id - Delete a department
 */
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 })
    }

    const deleted = await Department.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Department deleted successfully" }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
