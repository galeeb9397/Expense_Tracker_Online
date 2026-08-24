import express from "express";
import {
    registerUser,
    loginUser,
    getUserDetails,
    updateProfiles,
    changePassword
} from "../controllers/userController.js";

import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// protected Routes
userRouter.get("/me", authMiddleware, getUserDetails);
userRouter.put("/profile", authMiddleware, updateProfiles);
userRouter.put("/password", authMiddleware, changePassword);


export default userRouter;
