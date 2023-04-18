import express from "express";
import ChatsModel from "./model.js";

const router = express.Router();

router.get("/chats", async (req, res) => {
  const userId = req.user.id; // assuming that you have a middleware to verify the user's identity and store their ID in req.user
  const chats = await ChatsModel.find({ members: userId })
    .populate("members", "username email avatar")
    .exec();
  res.json(chats);
});

export default router;
