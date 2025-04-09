const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db"); // Your DB connection
const authenticateToken = require("../middleware/authMiddleware");
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

const transporter = nodemailer.createTransport({
    host: 'main.mta.ro',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Login route to authenticate user and generate tokens
router.post("/login", async (req, res) => {
    const { identifier, password } = req.body;
    // Fetch user from DB
    const [user] = await db.promise().query(
        "SELECT id, email, password, user_type FROM users WHERE email = ? OR phone = ?",
        [identifier, identifier]
    );

    if (user.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
        { id: user[0].id, email: user[0].email, user_type: user[0].user_type },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // Short-lived token
    );

    const refreshToken = jwt.sign(
        { id: user[0].id },
        process.env.REFRESH_SECRET,
        { expiresIn: "7d" } // Long-lived refresh token
    );
    //console.log(user);
    const id = user[0].id;
    // Send the generated tokens
    res.json({ token, id });
});

// Get user details route (protected route)
router.get("/user/:id", authenticateToken, async (req, res) => {
    const userId = req.params.id;
    if (req.user.id !== parseInt(userId)) {
        return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    // Fetch user data from DB
    const [user] = await db.promise().query(
        "SELECT id, firstname, lastname, email, phone, address, user_type FROM users WHERE id = ?",
        [userId]
    );

    if (user.length === 0) {
        return res.status(404).json({ message: "User not found" });
    }
    console.log(user);
    res.json(user[0]);
});

// Add these helper functions
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Add these new routes
router.post('/send-reset-email', async (req, res) => {
    const { email } = req.body;
    console.log('Received password reset request for email:', email);

    try {
        // Find user by email
        const [user] = await db.promise().query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        console.log('Found user:', user[0] ? 'Yes' : 'No');

        if (!user[0]) {
            console.log('User not found for email:', email);
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token and expiry
        const resetToken = generateResetToken();
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        console.log('Generated reset token:', resetToken);
        console.log('Token expiry:', resetTokenExpiry);

        // Save token and expiry to user record
        await db.promise().query(
            "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
            [resetToken, resetTokenExpiry, email]
        );

        // Create reset URL
        const resetUrl = `${process.env.REACT_APP_FRONTEND_URL}/reset-password?token=${resetToken}`;
        console.log('Reset URL generated:', resetUrl);

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        console.log('Attempting to send email with options:', {
            from: process.env.EMAIL_USER,
            to: email,
            subject: mailOptions.subject
        });

        try {
            await transporter.sendMail(mailOptions);
            console.log('Password reset email sent successfully');
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            throw emailError;
        }

        res.json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error('Error in password reset process:', error);
        res.status(500).json({ message: 'Error sending reset email' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    console.log('Received password reset request with token');

    if (!token || !newPassword) {
        console.log('Missing token or new password');
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    try {
        // First, check if the token exists and is not expired
        const [users] = await db.promise().query(
            "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
            [token]
        );

        console.log('Token validation:', users.length > 0 ? 'Valid' : 'Invalid/Expired');

        if (!users[0]) {
            return res.status(400).json({
                message: 'Invalid or expired reset link. Please request a new password reset.'
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('Password hashed successfully');

        // Update the password and clear the reset token
        await db.promise().query(
            `UPDATE users 
             SET password = ?, 
                 reset_token = NULL, 
                 reset_token_expiry = NULL 
             WHERE reset_token = ?`,
            [hashedPassword, token]
        );

        console.log('Password updated successfully');

        // Send success response
        res.json({
            message: 'Password has been reset successfully. You can now log in with your new password.'
        });

    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).json({
            message: 'An error occurred while resetting your password. Please try again.'
        });
    }
});

module.exports = router;
