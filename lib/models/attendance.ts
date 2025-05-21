import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { IStudent } from "./student"

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId | IStudent
  classId: mongoose.Types.ObjectId
  courseId: mongoose.Types.ObjectId
  date: Date
  isPresent: boolean
}

const AttendanceSchema: Schema<IAttendance> = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    date: {
      type: Date  
    },
    isPresent: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema)
