import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { IStudent } from "./student"

export type FeeStatus = "partial" | "paid" | "unpaid"
export type FinanceType = "admission" | "registration" | "tuition" | "library" | "other"

export interface IFee extends Document {
  studentId: mongoose.Types.ObjectId | IStudent
  financeType: FinanceType
  amount: number
  amountPaid: number
  balance: number
  status: FeeStatus
  description?: string
  date: Date
}

const FeeSchema: Schema<IFee> = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
    },
    financeType: {
      type: String,
      enum: ["admission", "registration", "tuition", "library", "other"],
      required: [true, "Finance type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Amount must be a positive number"],
    },
    amountPaid: {
      type: Number,
      required: [true, "Amount paid is required"],
      min: [0, "Amount paid must be a positive number"],
      default: 0,
    },
    balance: {
      type: Number,
      required: true,
      default: function (this: IFee) {
        return this.amount - this.amountPaid
      },
    },
    status: {
      type: String,
      enum: ["partial", "paid", "unpaid"],
      default: "unpaid",
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Optional: keep balance and status in sync on save
FeeSchema.pre("save", function (next) {
  this.balance = this.amount - this.amountPaid

  if (this.amountPaid >= this.amount) {
    this.status = "paid"
    this.balance = 0
  } else if (this.amountPaid > 0) {
    this.status = "partial"
  } else {
    this.status = "unpaid"
  }

  next()
})

export const Fee: Model<IFee> = mongoose.models.Fee || mongoose.model<IFee>("Fee", FeeSchema)
