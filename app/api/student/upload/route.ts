import { NextRequest, NextResponse } from "next/server"
import Student from "@/lib/models/student"
import connectToDatabase from "@/lib/db"
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const body = await req.json()

    const {students}=body
    const studentsToInsert = students.map((student:any) => {
      const {
        name,
        gender,
        parentPhone,
        phone,
        studentId,
        status,
        classId,
      } = student

      if (!name || !parentPhone || !studentId ||  !classId) {
        throw new Error("Missing required fields in one or more students")
      }

    return {
      name,
      gender,
      parentPhone,
      phone,
      studentId,
      status: typeof status === "string" ? status.toLowerCase() : "active",
      classId,
    }
    })

    const inserted = await Student.insertMany(studentsToInsert)
    return NextResponse.json({ message: "Students inserted successfully", inserted }, { status: 201 })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 })
  }
}
