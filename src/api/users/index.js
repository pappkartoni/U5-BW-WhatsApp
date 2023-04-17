import express from "express"
import createError from "http-errors"
import UsersModel from "./model.js"
import createHttpError from "http-errors"
import { createTokens, verifyAndRefreshTokens } from "../../lib/tools.js"

const usersRouter = express.Router()

usersRouter.get("/", async (req, res, next) => {

})

usersRouter.get("/me", async (req, res, next) => {
    
})

usersRouter.put("/me", async (req, res, next) => {

})

usersRouter.post("/me/avatar", async (req, res, next) => {

})
usersRouter.get("/:userId", async (req, res, next) => {

})
usersRouter.post("/account", async (req, res, next) => {
    try {
        const newUser = new UsersModel(req.body)
        const {_id} = await newUser.save()
        const {accessToken, refreshToken} = await createTokens(newUser)

        res.send({_id, accessToken, refreshToken})
    } catch (error) {
        next(error)
    }
})

usersRouter.post("/session", async (req, res, next) => {
    try {
        const {email, password} = req.body

        const user = await UsersModel.checkCredentials(email, password)
        if (user) {
            const {accessToken, refreshToken} = await createTokens(user)
            res.send({accessToken, refreshToken})
        } else {
            next(createHttpError(401, "Invalid credentials"))
        }
    } catch (error) {
        next(error)
    }
})

usersRouter.delete("/session", async (req, res, next) => {
    try {
        const {currentRefreshToken} = req.body
        const user = await UsersModel.findOne({refreshToken: currentRefreshToken})
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
        const {currentRefreshToken} = req.body
        const {accessToken, refreshToken} = await verifyAndRefreshTokens(currentRefreshToken)
        res.send({accessToken, refreshToken})
    } catch (error) {
        next(error)
    }
})

export default usersRouter