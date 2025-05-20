import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Fee } from "@/lib/models/fee"
import "@/lib/models/student" // Register Student model
import mongoose from "mongoose"

/**
 * GET /api/fees/:id
 * Get single fee record with student info
 */
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid fee ID" }, { status: 400 })
    }

    const fee = await Fee.findById(id).populate("studentId", "name")

    if (!fee) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 })
    }

    return NextResponse.json(fee, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PUT /api/fees/:id
 * Update a fee record and recalculate balance & status
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const body = await request.json()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid fee ID" }, { status: 400 })
    }

    if (body.studentId && !mongoose.Types.ObjectId.isValid(body.studentId)) {
      return NextResponse.json({ error: "Invalid studentId" }, { status: 400 })
    }

    // Auto-calculate balance and status
    if (body.amount != null && body.amountPaid != null) {
      body.balance = body.amount - body.amountPaid
    if (body.amountPaid == null || body.amountPaid <= 0) {
      body.status = "unpaid"
    } else if (body.amountPaid > 0 && body.amountPaid < body.amount) {
      body.status = "partial"
    } else if (body.balance <= 0) {
      body.status = "paid"
    } else {
      body.status = "unpaid"
    }
    }

    const updatedFee = await Fee.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
      context: "query",
    }).populate("studentId", "name")

    if (!updatedFee) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 })
    }

    return NextResponse.json(updatedFee, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/fees/:id
 * Delete a fee record
 */
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid fee ID" }, { status: 400 })
    }

    const deleted = await Fee.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Fee record deleted successfully" }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
