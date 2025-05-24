import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Department from "@/lib/models/department"
import mongoose from "mongoose"

/**
 * GET /api/department
 * Get all departments  information
 */
export async function GET() {
  try {
    await connectDB()
    const departments = await Department.find({}).sort({ createdAt: -1 })

    return NextResponse.json(departments, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/department
 * Create a new department
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Validate request body
    if (!body.name || !body.facultyId || !body.departmentMode) {
      return NextResponse.json({ error: "Name, facultyId, and departmentMode are required" }, { status: 400 })
    }


    // Create new department
    const department = await Department.create({
      name: body.name,
      studentCount: body.studentCount || 0,
      departmentMode: body.departmentMode,
    })

    // Populate faculty information
    await department.populate("facultyId", "name")

    return NextResponse.json(department, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
