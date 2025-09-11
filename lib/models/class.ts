import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { IFaculty } from "./faculty"
import type { IDepartment } from "./department"

import type { IAcademicYear } from "./academicyear"

export interface IClass extends Document {
  facultyId: mongoose.Types.ObjectId | IFaculty
  departmentId: mongoose.Types.ObjectId | IDepartment
  academicYearId: mongoose.Types.ObjectId | IAcademicYear
  semester: number
  classMode: "full time" | "part time"
  type: string
  status: string
}

const ClassSchema: Schema = new Schema(
  {
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: "Faculty"
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department ID is required"],
    },
    academicYearId: {
      type: Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: [true, "Academic Year is required"],
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: 1,
      max: 8,
    },
    classMode: {
      type: String,
      required: [true, "💡 Class mode is required."],
      enum: {
        values: ["full time", "part time"],
        message: 'Class mode must be either "full time" or "part time".',
      },
    },
    type: {
      type: String,
      required: [true, "Class type is required"],
      uppercase: true,
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
const Class: Model<IClass> = mongoose.models.Class || mongoose.model<IClass>("Class", ClassSchema)

export default Class
