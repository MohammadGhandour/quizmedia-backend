const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");

const auth = (req, res, next) => {
    const token = req.cookies.token; // Get token from cookies

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
};

module.exports = auth;
