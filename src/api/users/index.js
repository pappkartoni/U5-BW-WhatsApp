import express from "express";
import createError from "http-errors";
import UsersModel from "./model.js";

const usersRouter = express.Router();

usersRouter.get("/", async (req, res, next) => {});

usersRouter.get("/me", async (req, res, next) => {});

usersRouter.put("/me", async (req, res, next) => {});

usersRouter.post("/me/avatar", async (req, res, next) => {});
usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const users = await UsersModel.findById(req.params.userId);
    if (users) {
      res.send(users);
    } else {
      next(createError(404, `User with id ${req.params.userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});
usersRouter.post("/account", async (req, res, next) => {});
usersRouter.post("/session", async (req, res, next) => {});
usersRouter.delete("/session", async (req, res, next) => {});
usersRouter.post("/session/refresh", async (req, res, next) => {});

export default usersRouter;
