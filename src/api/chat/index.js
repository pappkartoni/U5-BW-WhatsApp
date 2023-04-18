import express from "express";
import ChatsModel from "./model.js";
import { jwtAuth } from "../../lib/tools";

const router = express.Router();

router.get("/chats", jwtAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await ChatsModel.find({ members: userId }).populate(
      "members",
      "username email avatar"
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

router.post("/chats", jwtAuth, async (req, res, next) => {
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

      // const senderSocket = socketMap.get(senderId);
      // const recipientSocket = socketMap.get(recipientId);

      // if (senderSocket) {
      //   senderSocket.join(newChat._id);
      // }
      // if (recipientSocket) {
      //   recipientSocket.join(newChat._id);
      // }

      res.status(201).send(newChat);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/chats/:id", async (req, res, next) => {
  try {
    const chatId = req.params.id;

    const chat = await ChatsModel.findOne({ _id: chatId }).populate(
      "members",
      "username email avatar"
    );
    if (!chat) {
      return next(createError(404, "Chat not found"));
    }

    res.status(200).send(chat);
  } catch (error) {
    next(error);
  }
});

export default router;
