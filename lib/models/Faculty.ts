import mongoose from "mongoose"

const facultySchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Faculty || mongoose.model("Faculty", facultySchema)
