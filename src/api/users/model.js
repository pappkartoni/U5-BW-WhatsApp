import mongoose from "mongoose"

const { Schema, model } = mongoose

const UsersSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    avatar: { type: String },
  },
  {
    timestamps: true,
  }
)

export default model("user", UsersSchema)
