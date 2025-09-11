import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import AcademicYear from "@/lib/models/academicyear"
import mongoose from "mongoose"

// GET all academic years
export async function GET() {
  try {
    await connectDB()
    // Populate any related fields (e.g., classes referencing this academic year)
    const records = await AcademicYear.find()
      .sort({ startDate: -1 })
      // .populate({
      //   path: "", // No direct references, but placeholder for future relations
      // })
    return NextResponse.json(records, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST new academic year
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, startDate, endDate, isActive } = body
    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (isActive) {
      const existingActive = await AcademicYear.findOne({ isActive: true })
      if (existingActive) {
        return NextResponse.json({ error: "There is already an active academic year. Deactivate it first." }, { status: 400 })
      }
    }
    const academicYear = await AcademicYear.create({
      name,
      startDate,
      endDate,
      isActive: isActive ?? false,
    })
    return NextResponse.json(academicYear, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT update academic year by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const body = await req.json()
    if (body.isActive) {
      const existingActive = await AcademicYear.findOne({ isActive: true, _id: { $ne: id } })
      if (existingActive) {
        return NextResponse.json({ error: "There is already an active academic year. Deactivate it first." }, { status: 400 })
      }
    }
    const updated = await AcademicYear.findByIdAndUpdate(id, body, { new: true })
    if (!updated) {
      return NextResponse.json({ error: "Academic year not found" }, { status: 404 })
    }
    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
