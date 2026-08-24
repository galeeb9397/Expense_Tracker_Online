import mongoose from "mongoose";
import dns from "dns";

// Fix Node.js DNS resolution issues with MongoDB Atlas SRV lookup on Windows
try {
    if (dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder("ipv4first");
    }
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (error) {
    console.warn("Could not set custom DNS servers:", error.message);
}

export const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || "mongodb+srv://solosungjinwoo763_db_user:DnTUNhrhXgcxTX4e@cluster0.nkm49di.mongodb.net/Expense?retryWrites=true&w=majority";
        
        mongoose.connection.on("connected", () => {
            console.log("Mongoose connected to DB");
        });

        mongoose.connection.on("error", (err) => {
            console.error("Mongoose connection error:", err.message);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("Mongoose disconnected from DB");
        });

        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`DB CONNECTED: ${conn.connection.host}`);
    } catch (error) {
        console.error("DB CONNECTION ERROR:", error.message);
    }
};

