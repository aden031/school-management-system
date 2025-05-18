import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { IStudent } from "./student"

export interface IFinance extends Document {
  studentId: mongoose.Types.ObjectId | IStudent
  amount: number
  type: "tuition" | "registration" | "library" | "other"
  description?: string
  date: Date
  status: "paid" | "unpaid" | "partial"
}

const FinanceSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be a positive number"],
    },
    type: {
      type: String,
      enum: ["tuition", "registration", "library", "other"],
      required: [true, "Finance type is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "unpaid", "partial"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const Finance: Model<IFinance> =
  mongoose.models.Finance || mongoose.model<IFinance>("Finance", FinanceSchema)
