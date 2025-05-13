import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const db = await connectToDatabase()
    const departments = await db.collection("Department").find({}).toArray()

    // Fetch faculty names for each department
    const facultyIds = [...new Set(departments.map((dept) => dept.FucaltyId))]
    const faculties = await db
      .collection("Faculty")
      .find({
        _id: { $in: facultyIds.map((id) => new ObjectId(id)) },
      })
      .toArray()

    const facultyMap = faculties.reduce((map, faculty) => {
      map[faculty._id.toString()] = faculty.Name
      return map
    }, {})

    const enrichedDepartments = departments.map((dept) => ({
      ...dept,
      FacultyName: facultyMap[dept.FucaltyId] || "Unknown Faculty",
    }))

    return NextResponse.json(enrichedDepartments)
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { FucaltyId, Name, SCount, DepartmentMode } = await request.json()

    if (!FucaltyId || !Name || SCount === undefined || !DepartmentMode) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const result = await db.collection("Department").insertOne({
      FucaltyId,
      Name,
      SCount,
      DepartmentMode,
    })

    return NextResponse.json(
      {
        id: result.insertedId,
        FucaltyId,
        Name,
        SCount,
        DepartmentMode,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating department:", error)
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, FucaltyId, Name, SCount, DepartmentMode } = await request.json()

    if (!id || !FucaltyId || !Name || SCount === undefined || !DepartmentMode) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const db = await connectToDatabase()
    await db
      .collection("Department")
      .updateOne({ _id: new ObjectId(id) }, { $set: { FucaltyId, Name, SCount, DepartmentMode } })

    return NextResponse.json({ id, FucaltyId, Name, SCount, DepartmentMode })
  } catch (error) {
    console.error("Error updating department:", error)
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const db = await connectToDatabase()
    await db.collection("Department").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ message: "Department deleted successfully" })
  } catch (error) {
    console.error("Error deleting department:", error)
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 })
  }
}
