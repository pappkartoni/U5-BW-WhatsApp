import express from "express"
import createError from "http-errors"
import UsersModel from "./model.js"
import createHttpError from "http-errors"
import { cloudinaryUploader, createTokens, jwtAuth, verifyAndRefreshTokens } from "../../lib/tools.js"
import passport from "passport"

const usersRouter = express.Router()

usersRouter.get("/googlelogin", passport.authenticate("google", { scope: ["profile", "email"]}))

usersRouter.get("/googlecallback", passport.authenticate("google", { session: false }), (req, res, next) => {
    try {
        res.redirect(`${process.env.FE_URL}?refreshToken=${req.user.refreshToken}`) //not sure about this one
    } catch (error) {
        next(error)
    }
})

usersRouter.get("/", async (req, res, next) => {
    try {
        const { q } = req.query;
        let query = {};

        if (q) {
            query.$or = [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }];
        }

        const users = await UsersModel.find(query);
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
});

usersRouter.get("/me", async (req, res, next) => {
    try {
        const userId = req.query.userId;
        const currentUser = await UsersModel.findById(userId);

        if (currentUser) {
            res.status(200).json(currentUser);
        } else {
            next(createError(404, "User not found"));
        }
    } catch (error) {
        next(error);
    }
});

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
        next(error);
    }
});

usersRouter.post("/me/avatar", jwtAuth, cloudinaryUploader, async (req, res, next) => {
    try {
        const updatedUser = await UsersModel.findByIdAndUpdate(req.user._id, {avatar: req.file.path}, {new: true, runValidators: true})
        res.send(updatedUser)
    } catch (error) {
        next(error)
    }
});

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

usersRouter.post("/account", async (req, res, next) => {
    try {
        const newUser = new UsersModel(req.body)
        const { _id } = await newUser.save()
        const { accessToken, refreshToken } = await createTokens(newUser)

        res.send({ _id, accessToken, refreshToken })
    } catch (error) {
        next(error)
    }
})

usersRouter.post("/session", async (req, res, next) => {
    try {
        const { email, password } = req.body

        const user = await UsersModel.checkCredentials(email, password)
        if (user) {
            const { accessToken, refreshToken } = await createTokens(user)
            res.send({ accessToken, refreshToken })
        } else {
            next(createHttpError(401, "Invalid credentials"))
        }
    } catch (error) {
        next(error)
    }
})

usersRouter.delete("/session", async (req, res, next) => {
    try {
        const { currentRefreshToken } = req.body
        const user = await UsersModel.findOne({ refreshToken: currentRefreshToken })
        if (user) {
            user.refreshToken = undefined
            user.save()
            res.status(204).send()
        } else {
            next(createHttpError(401, "Invalid token"))
        }
    } catch (error) {
        next(error)
    }
})

usersRouter.post("/session/refresh", async (req, res, next) => {
    try {
        const { currentRefreshToken } = req.body
        const { accessToken, refreshToken } = await verifyAndRefreshTokens(currentRefreshToken)
        res.send({ accessToken, refreshToken })
    } catch (error) {
        next(error)
    }
})

export default usersRouter