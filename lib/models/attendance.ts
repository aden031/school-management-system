import mongoose, { Schema, type Document, type Model } from "mongoose"
import { IStudent } from "./student"


export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId | IStudent
  date: Date
  isPresent: boolean
}

const AttendanceSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    isPresent: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema)