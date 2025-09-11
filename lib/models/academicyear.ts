import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IAcademicYear extends Document {
	name: string // e.g., "2025/2026"
	startDate: Date
	endDate: Date
	isActive: boolean
}

const AcademicYearSchema: Schema<IAcademicYear> = new Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
)


// Ensure only one academic year is active at a time
AcademicYearSchema.pre("save", async function (next) {
	if (this.isActive) {
		await this.constructor.updateMany({ isActive: true }, { isActive: false })
	}
	next()
})

const AcademicYear: Model<IAcademicYear> =
	mongoose.models.AcademicYear || mongoose.model<IAcademicYear>("AcademicYear", AcademicYearSchema)

export default AcademicYear
