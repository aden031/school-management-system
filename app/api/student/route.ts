import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const db = await connectToDatabase()
    const students = await db.collection("Student").find({}).toArray()

    // Fetch faculty and class information
    const facultyIds = [...new Set(students.map((student) => student.FucaltyId))]
    const classIds = [...new Set(students.map((student) => student.classId))]

    const faculties = await db
      .collection("Faculty")
      .find({
        _id: { $in: facultyIds.map((id) => new ObjectId(id)) },
      })
      .toArray()

    const classes = await db
      .collection("Classes")
      .find({
        _id: { $in: classIds.map((id) => new ObjectId(id)) },
      })
      .toArray()

    const facultyMap = faculties.reduce((map, faculty) => {
      map[faculty._id.toString()] = faculty.Name
      return map
    }, {})

    const classMap = classes.reduce((map, cls) => {
      map[cls._id.toString()] = `${cls.semesterName}-${cls.type} (${cls.classMode})`
      return map
    }, {})

    const enrichedStudents = students.map((student) => ({
      ...student,
      FacultyName: facultyMap[student.FucaltyId] || "Unknown Faculty",
      ClassName: classMap[student.classId] || "Unknown Class",
    }))

    return NextResponse.json(enrichedStudents)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { FucaltyId, classId, NAME, GENDER, ParentPhone, phone, ID, passcode, status } = await request.json()

    if (!FucaltyId || !classId || !NAME || !ParentPhone || !ID) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Check if ID already exists
    const existingStudent = await db.collection("Student").findOne({ ID })
    if (existingStudent) {
      return NextResponse.json({ error: "Student ID already exists" }, { status: 400 })
    }

    const result = await db.collection("Student").insertOne({
      FucaltyId,
      classId,
      NAME,
      GENDER: GENDER || null,
      ParentPhone,
      phone: phone || null,
      ID,
      passcode: passcode || "1234",
      status: status || "active",
    })

    return NextResponse.json(
      {
        id: result.insertedId,
        FucaltyId,
        classId,
        NAME,
        GENDER,
        ParentPhone,
        phone,
        ID,
        passcode: passcode || "1234",
        status: status || "active",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, FucaltyId, classId, NAME, GENDER, ParentPhone, phone, ID, passcode, status } = await request.json()

    if (!id || !FucaltyId || !classId || !NAME || !ParentPhone || !ID) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Check if ID already exists for another student
    const existingStudent = await db.collection("Student").findOne({
      ID,
      _id: { $ne: new ObjectId(id) },
    })

    if (existingStudent) {
      return NextResponse.json({ error: "Student ID already exists" }, { status: 400 })
    }

    await db.collection("Student").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          FucaltyId,
          classId,
          NAME,
          GENDER,
          ParentPhone,
          phone,
          ID,
          passcode,
          status,
        },
      },
    )

    return NextResponse.json({
      id,
      FucaltyId,
      classId,
      NAME,
      GENDER,
      ParentPhone,
      phone,
      ID,
      passcode,
      status,
    })
  } catch (error) {
    console.error("Error updating student:", error)
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 })
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
    await db.collection("Student").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ message: "Student deleted successfully" })
  } catch (error) {
    console.error("Error deleting student:", error)
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 })
  }
}
