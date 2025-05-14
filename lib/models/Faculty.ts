import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IFaculty extends Document {
  name: string
}

const FacultySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Faculty name is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Create or retrieve the model
const Faculty: Model<IFaculty> = mongoose.models.Faculty || mongoose.model<IFaculty>("Faculty", FacultySchema)

export default Faculty
