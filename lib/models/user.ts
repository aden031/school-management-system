import mongoose, { Schema, model, models } from 'mongoose'

const UserSchema = new Schema(
  {
    FullName: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    Title: {
      type: String,
      enum: ['parent', 'teacher', 'officer' , 'student' , 'admin'],
      default: 'teacher',
    },
    studentId :{type:String},
    Status: {
      type: String,
      enum: ['active', 'inactive'], // ✅ only these 2
      default: 'active',
    },
    phone:{
      type:Number , 
      required:[true , "please provide user phone !"]
    }
  },
  { timestamps: true }
)

const User = models.User || model('User', UserSchema)
export default User
