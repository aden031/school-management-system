import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Student from "@/lib/models/student"
import mongoose from "mongoose"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const { id } = params

        if(!id){
                return NextResponse.json({ error: "phone is required" }, { status: 400 })
        }


    const student = await Student.find({parentPhone:id})

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(student, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
