import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Class from "@/lib/models/class"
import AcademicYear from "@/lib/models/academicyear"
import Faculty from "@/lib/models/faculty"
import Department from "@/lib/models/department"
import mongoose from "mongoose"

/**
 * GET /api/classes
 * Get all classes with faculty and department information
 */
export async function GET() {
  try {
    await connectDB()
    const classes = await Class.find({})
      .populate("departmentId", "name")
      .populate("academicYearId", "name startDate endDate isActive")
      .sort({ createdAt: -1 })

    return NextResponse.json(classes, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/classes
 * Create a new class
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Validate request body
    if (!body.departmentId || !body.semester || !body.classMode || !body.type) {
      return NextResponse.json(
        {
          error: "department ID, semester, class mode, and type are required",
        },
        { status: 400 },
      )
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(body.departmentId)) {
      return NextResponse.json({ error: "Invalid faculty or department ID" }, { status: 400 })
    }


    // Check if department exists
    const department = await Department.findById(body.departmentId)
    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }


    // Find the active academic year
    const activeAcademicYear = await AcademicYear.findOne({ isActive: true })
    if (!activeAcademicYear) {
      return NextResponse.json({ error: "No active academic year found" }, { status: 400 })
    }

    // Create new class with academicYearId
    const newClass = await Class.create({
      departmentId: body.departmentId,
      semester: body.semester,
      classMode: body.classMode,
      type: body.type,
      status: body.status || "active",
      academicYearId: activeAcademicYear._id,
    })


    // Populate department and academic year information
    await newClass.populate([
      { path: "departmentId", select: "name" },
      { path: "academicYearId", select: "name startDate endDate isActive" },
    ])

    return NextResponse.json(newClass, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
 