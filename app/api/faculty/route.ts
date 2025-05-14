import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Faculty from "@/lib/models/faculty"

/**
 * GET /api/faculty
 * Get all faculties
 */
export async function GET() {
  try {
    await connectDB()
    const faculties = await Faculty.find({}).sort({ createdAt: -1 })

    return NextResponse.json(faculties, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/faculty
 * Create a new faculty
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Validate request body
    if (!body.name) {
      return NextResponse.json({ error: "Faculty name is required" }, { status: 400 })
    }

    // Create new faculty
    const faculty = await Faculty.create({
      name: body.name,
    })

    return NextResponse.json(faculty, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
