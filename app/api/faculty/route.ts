import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const db = await connectToDatabase()
    const faculties = await db.collection("Faculty").find({}).toArray()

    return NextResponse.json(faculties)
  } catch (error) {
    console.error("Error fetching faculties:", error)
    return NextResponse.json({ error: "Failed to fetch faculties" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { Name } = await request.json()

    if (!Name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const result = await db.collection("Faculty").insertOne({
      Name,
    })

    return NextResponse.json(
      {
        id: result.insertedId,
        Name,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating faculty:", error)
    return NextResponse.json({ error: "Failed to create faculty" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, Name } = await request.json()

    if (!id || !Name) {
      return NextResponse.json({ error: "ID and Name are required" }, { status: 400 })
    }

    const db = await connectToDatabase()
    await db.collection("Faculty").updateOne({ _id: new ObjectId(id) }, { $set: { Name } })

    return NextResponse.json({ id, Name })
  } catch (error) {
    console.error("Error updating faculty:", error)
    return NextResponse.json({ error: "Failed to update faculty" }, { status: 500 })
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
    await db.collection("Faculty").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ message: "Faculty deleted successfully" })
  } catch (error) {
    console.error("Error deleting faculty:", error)
    return NextResponse.json({ error: "Failed to delete faculty" }, { status: 500 })
  }
}
