import User from "./user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";
// import transporter from "../config/nodemailer.js";
import { EMAIL_WELCOME_TEMPLATE } from "../templates/welcomeEamil.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../templates/forgotPassandaccverify.js";
import { emailQueue } from "../utils/emailQueue.js";

// Regex patterns for validation
const VALIDATION_REGEX = {
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^[0-9]{10}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};


export const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Log Arcjet decision if available
        if (req.arcjetDecision) {
            console.log("Registration attempt from:", {
                ip: req.arcjetDecision.ip,
                decision: req.arcjetDecision.conclusion,
            });
        }

        // Check if fields exist
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!"
            });
        }

        // Trim inputs
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();
        const trimmedPhone = phone.trim();

        // Validate email with regex
        if (!VALIDATION_REGEX.email.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        // Validate phone with regex
        if (!VALIDATION_REGEX.phone.test(trimmedPhone)) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be exactly 10 digits"
            });
        }

        // Validate password with regex
        if (!VALIDATION_REGEX.password.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)"
            });
        }

        // Check for existing user
        const existingUser = await User.findOne({ where: { email: trimmedEmail } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        // Check for existing phone (ADDED)
        const existingPhone = await User.findOne({ where: { phone: trimmedPhone } });
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: "Phone number already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
            password: hashedPassword
        });

        // Send welcome email using EMAIL QUEUE (FIXED - removed duplicate transporter.sendMail)
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: trimmedEmail,
            subject: `Welcome to Stackup, ${trimmedName}`,
            html: EMAIL_WELCOME_TEMPLATE
                .replace("{{name}}", trimmedName)
                .replace("{{email}}", trimmedEmail)

        };

        // Use email queue instead of direct transporter
        try {
            await emailQueue.addToQueue(mailOptions);
        } catch (emailError) {
            console.error('Email queue error:', emailError);
            // Don't fail registration if email fails
        }

        return res.status(201).json({
            success: true,
            message: "Account created successfully"
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to register"
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!",
            });
        }

        // FIXED: Trim and lowercase email for consistency
        const trimmedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ where: { email: trimmedEmail } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect Password!",
            });
        }

        generateTokenAndSetCookie(res, user.id);

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to login",
        });
    }
};

export const logout = async (req, res) => {
    try {
        return res.status(200).clearCookie("token").json({
            success: true,
            message: "Logout successfully!"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Logout failed!"
        });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated!",
            });
        }

        const user = await User.findByPk(userId, {
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load user profile",
        });
    }
};

export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(400).json({ message: "User not found", success: false });
        }

        if (user.isAccountVerified) {
            return res.status(400).json({ message: "Account already verified", success: false });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        // Update user fields
        user.verifyOtp = otp;
        user.verifyOtpExpiresAt = Date.now() + 5 * 60 * 1000;

        await user.save();

        // Send OTP email - FIXED: Use ONLY email queue, not both
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Verify Your Account",
            html: EMAIL_VERIFY_TEMPLATE
                .replace("{{otp}}", otp)
                .replace("{{email}}", user.email)
        };

        try {
            await emailQueue.addToQueue(mailOptions);
        } catch (emailError) {
            console.error("Email queue error:", emailError);
            return res.status(500).json({
                message: "Failed to send verification code",
                success: false,
            });
        }

        return res.json({ message: "Verification code sent successfully", success: true });
    } catch (error) {
        console.error("Error in sendVerifyOtp:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
};

export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(400).json({ message: "User not found", success: false });
        }

        if (user.verifyOtp !== String(otp)) {
            return res.status(400).json({ message: "Invalid OTP", success: false });
        }

        if (user.verifyOtpExpiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP expired", success: false });
        }

        // Update user fields
        user.isAccountVerified = true;
        user.verifyOtp = null;
        user.verifyOtpExpiresAt = null;

        await user.save();

        return res.json({ message: "Email verified successfully", success: true });
    } catch (error) {
        console.error("Error in verifyEmail:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
};

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required", success: false });
    }

    try {
        // FIXED: Trim and lowercase email
        const trimmedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ where: { email: trimmedEmail } });

        if (!user) {
            // FIXED: Don't reveal if user exists (security best practice)
            return res.json({
                message: "If an account exists with this email, you will receive a password reset code",
                success: true
            });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpiresAt = Date.now() + 10 * 60 * 1000;

        await user.save();

        // Send OTP email - FIXED: Use ONLY email queue
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Reset Your Password",
            html: PASSWORD_RESET_TEMPLATE
                .replace("{{otp}}", otp)
                .replace("{{email}}", user.email)
        };

        try {
            await emailQueue.addToQueue(mailOptions);
        } catch (emailError) {
            console.error("Email queue error:", emailError);
        }

        return res.json({
            message: "If an account exists with this email, you will receive a password reset code",
            success: true
        });

    } catch (error) {
        console.error("Error in sendResetOtp:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
};

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }

    try {
        // FIXED: Validate new password
        if (!VALIDATION_REGEX.password.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)"
            });
        }

        // FIXED: Trim and lowercase email
        const trimmedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ where: { email: trimmedEmail } });

        if (!user) {
            return res.status(400).json({ message: "Invalid request", success: false });
        }

        if (!user.resetOtp || user.resetOtp !== String(otp)) {
            return res.status(400).json({ message: "Invalid OTP", success: false });
        }

        if (user.resetOtpExpiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP expired", success: false });
        }

        // FIXED: Check if new password is same as old password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                message: "New password cannot be the same as old password",
                success: false
            });
        }

        // Hash new password
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password and clear reset OTP fields
        user.password = newHashedPassword;
        user.resetOtp = null;
        user.resetOtpExpiresAt = null;

        await user.save();

        return res.json({ message: "Password reset successfully", success: true });

    } catch (error) {
        console.error("Error in resetPassword:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
};