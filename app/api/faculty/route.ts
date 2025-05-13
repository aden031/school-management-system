import { NextResponse } from "next/server"
import Faculty from "@/lib/models/faculty" // Assuming model is in a separate file
import mongoose from "mongoose"

// GET: Fetch all faculties
export async function GET() {
  try {
    const faculties = await Faculty.find().lean() // Get all faculties
    return NextResponse.json(faculties)
  } catch (error) {
    console.error("Error fetching faculties:", error)
    return NextResponse.json({ error: "Failed to fetch faculties" }, { status: 500 })
  }
}

// POST: Create a new faculty
export async function POST(req: Request) {
  try {
    const { Name } = await req.json() // Extract Name from request

    if (!Name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const newFaculty = new Faculty({ Name }) // Create new faculty document
    await newFaculty.save() // Save to DB

    return NextResponse.json(
      { id: newFaculty._id, Name: newFaculty.Name }, // Respond with faculty data
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating faculty:", error)
    return NextResponse.json({ error: "Failed to create faculty" }, { status: 500 })
  }
}

// PUT: Update an existing faculty
export async function PUT(req: Request) {
  try {
    const { id, Name } = await req.json() // Extract id and Name from request

    if (!id || !Name) {
      return NextResponse.json({ error: "ID and Name are required" }, { status: 400 })
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      id, 
      { Name }, 
      { new: true } // Return the updated faculty
    )

    if (!updatedFaculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    return NextResponse.json(updatedFaculty)
  } catch (error) {
    console.error("Error updating faculty:", error)
    return NextResponse.json({ error: "Failed to update faculty" }, { status: 500 })
  }
}

// DELETE: Delete a faculty
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id") // Get the ID from query params

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const deletedFaculty = await Faculty.findByIdAndDelete(id) // Delete faculty by ID

    if (!deletedFaculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Faculty deleted successfully" })
  } catch (error) {
    console.error("Error deleting faculty:", error)
    return NextResponse.json({ error: "Failed to delete faculty" }, { status: 500 })
  }
}
