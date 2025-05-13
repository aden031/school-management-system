import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const db = await connectToDatabase()
    const classes = await db.collection("Classes").find({}).toArray()

    // Fetch faculty and department names
    const facultyIds = [...new Set(classes.map((cls) => cls.FucaltyId))]
    const departmentIds = [...new Set(classes.map((cls) => cls.departId))]

    const faculties = await db
      .collection("Faculty")
      .find({
        _id: { $in: facultyIds.map((id) => new ObjectId(id)) },
      })
      .toArray()

    const departments = await db
      .collection("Department")
      .find({
        _id: { $in: departmentIds.map((id) => new ObjectId(id)) },
      })
      .toArray()

    const facultyMap = faculties.reduce((map, faculty) => {
      map[faculty._id.toString()] = faculty.Name
      return map
    }, {})

    const departmentMap = departments.reduce((map, dept) => {
      map[dept._id.toString()] = dept.Name
      return map
    }, {})

    const enrichedClasses = classes.map((cls) => ({
      ...cls,
      FacultyName: facultyMap[cls.FucaltyId] || "Unknown Faculty",
      DepartmentName: departmentMap[cls.departId] || "Unknown Department",
    }))

    return NextResponse.json(enrichedClasses)
  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { FucaltyId, departId, semesterName, classMode, type, Status } = await request.json()

    if (!FucaltyId || !departId || !semesterName || !classMode || !type) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const result = await db.collection("Classes").insertOne({
      FucaltyId,
      departId,
      semesterName,
      classMode,
      type,
      Status: Status || "active",
    })

    return NextResponse.json(
      {
        id: result.insertedId,
        FucaltyId,
        departId,
        semesterName,
        classMode,
        type,
        Status: Status || "active",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating class:", error)
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, FucaltyId, departId, semesterName, classMode, type, Status } = await request.json()

    if (!id || !FucaltyId || !departId || !semesterName || !classMode || !type) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const db = await connectToDatabase()
    await db
      .collection("Classes")
      .updateOne({ _id: new ObjectId(id) }, { $set: { FucaltyId, departId, semesterName, classMode, type, Status } })

    return NextResponse.json({ id, FucaltyId, departId, semesterName, classMode, type, Status })
  } catch (error) {
    console.error("Error updating class:", error)
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 })
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
    await db.collection("Classes").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ message: "Class deleted successfully" })
  } catch (error) {
    console.error("Error deleting class:", error)
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 })
  }
}
