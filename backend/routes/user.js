const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db"); // Your DB connection
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

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
        { expiresIn: "15m" } // Short-lived token
    );

    const refreshToken = jwt.sign(
        { id: user[0].id },
        process.env.REFRESH_SECRET,
        { expiresIn: "7d" } // Long-lived refresh token
    );
    console.log(user);
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
        "SELECT id, firstname, lastname, email, phone, address FROM users WHERE id = ?",
        [userId]
    );

    if (user.length === 0) {
        return res.status(404).json({ message: "User not found" });
    }
    console.log(user);
    res.json(user[0]);
});


module.exports = router;
