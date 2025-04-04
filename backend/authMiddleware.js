const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "Access Denied" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach user data to request
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid Token" });
    }
};
