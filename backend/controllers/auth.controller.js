// controllers/authController.js
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ name: email }); // or { email }, based on your schema
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: '7d',
        });
        console.log("user is : " , user);
        console.log("token is : " , token);

        res.status(200).json({
            token,
            user: {
                name: user.name,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { name } = req.body;

        // Find the current user
        const user = await User.findById(req.userId).select("name email");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the new name is the same as the current one
        if (user.name === name) {
            return res.status(400).json({ error: "New name must be different from the current name." });
        }

        // Update the name
        user.name = name;
        await user.save();

        res.json({ message: "Updated successfully", user });
    } catch (err) {
        res.status(500).json({ error: "Failed to update" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        console.log("currentPassword : " , currentPassword);
        console.log("newPassword : " , newPassword);
        console.log("confirmPassword : " , confirmPassword);

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "New passwords do not match." });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        console.log("user is " , user)
        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "كلمة المرور الحالية غير صحيحة." });
        }

        // Hash new password and update
        user.password = newPassword;
        await user.save();

        res.json({ message: "تم تغيير كلمة المرور بنجاح" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "فشل تغيير كلمة المرور" });
    }
};
