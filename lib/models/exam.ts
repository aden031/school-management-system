import mongoose, { Schema, type Document, type Model } from 'mongoose'

export interface IExam extends Document {
  studentId: mongoose.Types.ObjectId
  examTypeId: mongoose.Types.ObjectId
  courseId: mongoose.Types.ObjectId
  marksObtained: number
  date: Date
}

const ExamSchema: Schema<IExam> = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    examTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'ExamType',
      required: [true, 'Exam Type is required'],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: [0, 'Marks cannot be negative'],
    },
    date: {
      type: Date,
      required: [true, 'Exam date is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const Exam: Model<IExam> = mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema)
