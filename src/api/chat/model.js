import mongoose from "mongoose";

const { Schema, model } = mongoose;


const MessageSchema = new Schema(
  {
    timestamp: { type: Number, required: true },
    sender: { type: Schema.Types.ObjectId, ref: "user" },
    content: {
      text: { type: String, required: true },
      media: { type: String },
    },
  },
  {
    timestamps: true,
  }
  );
  
  const ChatSchema = new Schema(
    {
      members: [{ type: Schema.Types.ObjectId, ref: "user" }],
      messages: [MessageSchema],
    },
    {
      timestamps: true,
    }
  );
  
export default model("chat", ChatSchema);
