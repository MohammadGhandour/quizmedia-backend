const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env");
// const { JW} = require("../config/env");

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.create({ username, password });
        return res.status(201).json(user);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// ✅ Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await user.destroy();
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(404).json({ error: "User not found" });

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "strict"
        });

        return res.status(200).json({ message: "Login successful", userId: user.id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

exports.checkIfConnected = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(200).json(null);
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.userId) return res.status(403).json({ error: "Invalid token" });
        const { userId } = decoded;
        const user = await User.findByPk(userId, { raw: true, attributes: { exclude: ["password"] } });
        return res.status(200).json(user);
    } catch (error) {
        return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully" });
};
