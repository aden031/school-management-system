import mongoose, { Schema, Document, Model } from 'mongoose'

export type ExamName = 'mid term' | 'final' | 'quiz'

export interface IExamType extends Document {
  name: ExamName
  marks: number
  description?: string
}

const ExamTypeSchema: Schema<IExamType> = new Schema({
  name: {
    type: String,
    enum: ['mid term', 'final', 'quiz'],
    required: true,
  },
  marks: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
})

const ExamTypeModel: Model<IExamType> =
  mongoose.models.ExamType || mongoose.model<IExamType>('ExamType', ExamTypeSchema)

export default ExamTypeModel
