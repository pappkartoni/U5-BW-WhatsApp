import express from "express";
import createError from "http-errors";
import UsersModel from "./model.js";

const usersRouter = express.Router()

usersRouter.get("/", async (req, res, next) => {

})

usersRouter.get("/me", async (req, res, next) => {

})

usersRouter.put("/me", async (req, res, next) => {
    try {
        const updates = req.body;
        const userId = req.query.userId;
        const updatedUser = await UsersModel.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        });

        if (updatedUser) {
            res.status(200).json(updatedUser);
        } else {
            next(createError(404, "User not found"));
        }
    } catch (error) {
        next();
    }
});

usersRouter.post("/me/avatar", async (req, res, next) => { });
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
usersRouter.post("/account", async (req, res, next) => { });
usersRouter.post("/session", async (req, res, next) => { });
usersRouter.delete("/session", async (req, res, next) => { });
usersRouter.post("/session/refresh", async (req, res, next) => { });

export default usersRouter;
