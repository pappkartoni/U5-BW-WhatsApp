import express from "express";
import ChatsModel from "./model.js";
import { jwtAuth } from "../../lib/tools.js";

const chatsRouter = express.Router();

chatsRouter.get("/", jwtAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await ChatsModel.find({ members: userId }).populate(
      "members",
      "name email avatar"
    );
    if (chats) {
      res.status(200).send(chats);
    } else {
      next(createError(404, "User not found"));
    }
  } catch (error) {
    next(error);
  }
});

chatsRouter.post("/", jwtAuth, async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user._id;

    const existingChat = await ChatsModel.findOne({
      members: { $all: [senderId, recipientId] },
    });

    if (existingChat) {
      res.status(200).send(existingChat);
    } else {
      const newChat = await ChatsModel.create({
        members: [senderId, recipientId],
        messages: [],
      });

      res.status(201).send(newChat);
    }
  } catch (error) {
    next(error);
  }
});

chatsRouter.get("/:id", jwtAuth, async (req, res, next) => {
  try {
    const chatId = req.params.id;

    const chat = await ChatsModel.findOne({ _id: chatId }).populate(
      "members",
      "name email avatar"
    );
    if (!chat) {
      return next(createError(404, "Chat not found"));
    }

    res.status(200).send(chat);
  } catch (error) {
    next(error);
  }
});

export default chatsRouter;
