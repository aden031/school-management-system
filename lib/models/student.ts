import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { IFaculty } from "./faculty"
import type { IClass } from "./class"

export interface IStudent extends Document {
  facultyId?: mongoose.Types.ObjectId | IFaculty
  classId: mongoose.Types.ObjectId | IClass
  name: string
  gender?: string
  parentPhone: string
  phone?: string
  studentId: number
  passcode: string
  status: string
}

const StudentSchema: Schema = new Schema(
  {
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: "Faculty"
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class ID is required"],
    },
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    parentPhone: {
      type: String,
      required: [true, "Parent phone number is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    studentId: {
      type: Number,
      required: [true, "Student ID is required"],
      unique: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Create or retrieve the model
const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema)

export default Student
