import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ChatSchema = new Schema(
  {
    members: [{ type: Schema.Types.ObjectId, ref: "user" }],
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

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

export default model("chat", ChatSchema);
