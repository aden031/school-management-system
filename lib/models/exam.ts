import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { IClass } from "./class"

export interface IExam extends Document {
  classId: mongoose.Types.ObjectId | IClass
  subject: string
  date: Date
  durationMinutes: number
  examType: "midterm" | "final" | "quiz"
}

const ExamSchema: Schema = new Schema(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class ID is required"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Exam date is required"],
    },
    durationMinutes: {
      type: Number,
      required: [true, "Duration is required"],
      min: [10, "Minimum duration is 10 minutes"],
    },
    examType: {
      type: String,
      enum: ["midterm", "final", "quiz"],
      required: [true, "Exam type is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const Exam: Model<IExam> =
  mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema)
