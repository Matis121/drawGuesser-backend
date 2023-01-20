const userController = require("./UserController");
const express = require("express");
const userRouter = express.Router();

userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);
userRouter.post("/increaseWins", userController.increaseWins);
userRouter.get("/leaderboard", userController.leaderboard);
userRouter.post("/changePassword", userController.changePassword);

module.exports = userRouter;
