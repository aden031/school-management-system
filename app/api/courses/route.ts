import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const db = await connectToDatabase()
    const courses = await db.collection("Coursees").find({}).toArray()

    // Fetch faculty and department names
    const facultyIds = [...new Set(courses.map((course) => course.FucaltyId))]
    const departmentIds = [...new Set(courses.map((course) => course.DepartID))]

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

    const enrichedCourses = courses.map((course) => ({
      ...course,
      FacultyName: facultyMap[course.FucaltyId] || "Unknown Faculty",
      DepartmentName: departmentMap[course.DepartID] || "Unknown Department",
    }))

    return NextResponse.json(enrichedCourses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { DepartID, CourseName, code, Semester, FucaltyId } = await request.json()

    if (!DepartID || !CourseName || !code || !Semester || !FucaltyId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Check if course name already exists
    const existingCourse = await db.collection("Coursees").findOne({ CourseName })
    if (existingCourse) {
      return NextResponse.json({ error: "Course name already exists" }, { status: 400 })
    }

    const result = await db.collection("Coursees").insertOne({
      DepartID,
      CourseName,
      code,
      Semester,
      FucaltyId,
    })

    return NextResponse.json(
      {
        id: result.insertedId,
        DepartID,
        CourseName,
        code,
        Semester,
        FucaltyId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating course:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, DepartID, CourseName, code, Semester, FucaltyId } = await request.json()

    if (!id || !DepartID || !CourseName || !code || !Semester || !FucaltyId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Check if course name already exists for another course
    const existingCourse = await db.collection("Coursees").findOne({
      CourseName,
      _id: { $ne: new ObjectId(id) },
    })

    if (existingCourse) {
      return NextResponse.json({ error: "Course name already exists" }, { status: 400 })
    }

    await db
      .collection("Coursees")
      .updateOne({ _id: new ObjectId(id) }, { $set: { DepartID, CourseName, code, Semester, FucaltyId } })

    return NextResponse.json({ id, DepartID, CourseName, code, Semester, FucaltyId })
  } catch (error) {
    console.error("Error updating course:", error)
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
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
    await db.collection("Coursees").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
