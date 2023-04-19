import express from "express";
import ChatsModel from "./model.js";
import { jwtAuth } from "../../lib/tools.js";
import createHttpError from "http-errors";
import { io } from "../../server.js"
let users = []

export const newConnectionHandler = socket => {
  console.log(`New client ${socket.id}`)
  socket.emit("welcome", {message: `What's up ${socket.id}`})
  
  socket.on("connect", payload => {
    users.push({ username: payload.username, socketId: socket.id })
    socket.emit("connected", users)
  })

  socket.on("join-room", room => 
      {
        console.log(room)
    	  socket.join(room)
    }
  )

  socket.on("outgoing-msg", async (data) => {
      socket.to(data.room).emit("newMessage", data)
      const newMsg = {
        sender: data.sender,
        content: {
          text: data.text
        }
      }
      console.log(data, newMsg)
      const updated = await ChatsModel.findByIdAndUpdate(data.room, {$push: {messages: newMsg}}, { new: true, runValidators: true })
  })

  socket.on("incoming-msg", (msg, room) => {

  })

  socket.on("disconnect", () => {
      users = users.filter(user => user.socketId !== socket.id)
      socket.broadcast.emit("updateOnlineUsersList", users)
  })
}

const chatsRouter = express.Router();

chatsRouter.get("/", jwtAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await ChatsModel.find({ members: userId }).populate(
      "members",
      "name email avatar"
    );
    if (chats) {
      chats.forEach(c => {
        if (c.members.includes(userId)) {
          io.socketsJoin(c._id)
        }
      })
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

chatsRouter.post("/:id/msg", jwtAuth, async (req, res, next) => {
  try {
    const newMsg = {sender: req.user._id, content: req.body}
    console.log(newMsg);
    const updatedChat = await ChatsModel.findByIdAndUpdate(req.params.id, {$push: {messages: newMsg}}, {new: true})
    console.log(updatedChat.messages);
    if (updatedChat) {
      res.send(updatedChat.messages)
    } else {
      createHttpError(404, `No chat with id ${req.params.id}`)
    }
  } catch (error) {
    next(error)
  }
})

export default chatsRouter;
