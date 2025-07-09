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
    },
    teacherId:{
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher ID is required"],
    },
    code: {
      type: String,
    },
    semester: {
      type: Number,
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
