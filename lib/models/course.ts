import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { IFaculty } from "./faculty"
import type { IDepartment } from "./department"

export interface ICourse extends Document {
  departmentId: mongoose.Types.ObjectId | IDepartment
  courseName: string
  code: string
  semester: number
  facultyId: mongoose.Types.ObjectId | IFaculty
}

const CourseSchema: Schema = new Schema(
  {
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department ID is required"],
    },
    courseName: {
      type: String,
      required: [true, "Course name is required"],
      unique: true,
      trim: true,
    },
    teacherId:{
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher ID is required"],
    },
    code: {
      type: String,
      required: [true, "Course code is required"],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: 1,
      max: 8,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Create or retrieve the model
const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema)

export default Course
