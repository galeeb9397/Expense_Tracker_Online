import User from'../models/userModel.js';
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const TOKEN_EXPIRATION="24h"; // Token expiration time
const createToken=(userId)=>{
    return jwt.sign({userId}, JWT_SECRET, {expiresIn: TOKEN_EXPIRATION});
}


 
// Register a User

export async function registerUser(req, res) {
    const { name, email, password } = req.body;
    if(!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields" 
        });
        
    }

    if (!validator.isEmail(email)) {
    return res.status(400).json({
        success: false,
        message: "Invalid email"
    });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be atleast of 8 characters."
        });
    }
    try {
        if(await User.findOne({email})) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }
        const hashed=await bcrypt.hash(password, 10);
        const user=await User.create({
            name,
            email,
            password: hashed
        });
        const token=createToken(user._id);
         res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
            
        });
    } catch (err) {
       console.error(err);
       res.status(500).json({
        success: false,
        message: "Server error"
       });
    }

}

//to login a user
export async function loginUser(req, res) {
    const { email, password } = req.body;
    if(!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields"
        });
    }
    try {
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        const token = createToken(user._id);
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

//to get user details
export async function getUserDetails(req, res) {
    try{
         const user = await User.findById(req.user.id).select('name email');
         if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found name email"
            });
         }
         res.json({
            success: true,
            user
         });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

//to update user profile
export async function updateProfiles(req, res) {
    const { name, email } = req.body;
    if(!name || !email || !validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields with valid information name and email" 
        });
    }
    try {
        const exists = await User.findOne({ email, _id: { $ne: req.user.id } });
        if(exists) {
            return res.status(409).json({
                success: false,
                message: "Email already in use"
            });
        }
        const user = await User.findByIdAndUpdate(req.user.id,
             { name, email },
              { new: true, runValidators: true }).select("name email");
              
        res.json({
            success: true,
            user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

// to change user password
export async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    if(!currentPassword || !newPassword|| newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: "password must be atleast of 8 characters."
        });
    }
    try {
        const user = await User.findById(req.user.id).select("password");
        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if(!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }
        
        user.password =  await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}
