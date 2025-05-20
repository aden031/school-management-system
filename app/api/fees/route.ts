import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import { Fee } from "@/lib/models/fee"
import "@/lib/models/student" // Register Student model
import mongoose from "mongoose"

/**
 * GET /api/fees
 * Get all fees with student info
 */
export async function GET() {
  try {
    await connectDB()
    const fees = await Fee.find({})
      .populate("studentId", "name")
      .sort({ createdAt: -1 })

    return NextResponse.json(fees, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/fees
 * Create a new fee record with calculated balance & status
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { studentId, financeType, amount, amountPaid, description, date } = body

    if (!studentId || !financeType || amount == null || amountPaid == null) {
      return NextResponse.json(
        { error: "studentId, financeType, amount, and amountPaid are required" },
        { status: 400 }
      )
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ error: "Invalid studentId" }, { status: 400 })
    }

    const balance = amount - amountPaid
    let status: string
    if (amountPaid == null || amountPaid <= 0) {
      status = "unpaid"
    } else if (amountPaid > 0 && amountPaid < amount) {
      status = "partial"
    } else if (balance <= 0) {
      status = "paid"
    } else {
      status = "unpaid"
    }
    const fee = await Fee.create({
      studentId,
      financeType,
      amount,
      amountPaid,
      balance,
      status,
      description,
      date,
    })

    await fee.populate("studentId", "name")

    return NextResponse.json(fee, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
