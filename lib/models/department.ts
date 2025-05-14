import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { IFaculty } from "./faculty"

export interface IDepartment extends Document {
  facultyId: mongoose.Types.ObjectId | IFaculty
  name: string
  studentCount: number
  departmentMode: string
}

const DepartmentSchema: Schema = new Schema(
  {
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: "Faculty",
      required: [true, "Faculty ID is required"],
    },
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
    },
    studentCount: {
      type: Number,
      default: 0,
    },
    departmentMode: {
      type: String,
      required: [true, "Department mode is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Create or retrieve the model
const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema)

export default Department
