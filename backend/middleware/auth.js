import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";


export default async function authMiddleware(req, res, next) {
    // grab the token from the request header
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authorization header missing or malformed"
        });
    }
    const token = authHeader.split(' ')[1];
// verify the token
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user=await User.findById(payload.userId).select("-password");

        if(!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
        req.user = user; // attach the user object to the request
        next(); // proceed to the next middleware or route handler
            
    }
    catch (err) {
        console.error("JWT verification error:", err);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }


}