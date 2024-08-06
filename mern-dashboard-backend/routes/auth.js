const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const createResponse = (status, message, path, type, data = {}) => ({
    status,
    message,
    path,
    type,
    ...data
});

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    const path = "/register";


    if (
        !username ||
        typeof username !== "string" ||
        username.length < 3 ||
        username.length > 20
    ) {
        return res
            .status(400)
            .json(
                createResponse(
                    400,
                    "Username must be between 3 and 20 characters long",
                    path,
                    "validation_error",
                    { error: "username" }
                )
            );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        return res
            .status(400)
            .json(
                createResponse(
                    400,
                    "Invalid email address",
                    path,
                    "validation_error",
                    { error: "email" }
                )
            );
    }

    if (
        !password ||
        typeof password !== "string" ||
        password.length < 6 ||
        password.length > 50
    ) {
        return res
            .status(400)
            .json(
                createResponse(
                    400,
                    "Password must be between 6 and 50 characters long",
                    path,
                    "validation_error",
                    { error: "password" }
                )
            );
    }

    try {
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res
                .status(400)
                .json(
                    createResponse(
                        400,
                        "Username already exists",
                        path,
                        "conflict",
                        { error: "username" }
                    )
                );
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res
                .status(400)
                .json(
                    createResponse(
                        400,
                        "Email already exists",
                        path,
                        "conflict",
                        { error: "email" }
                    )
                );
        }

        const user = new User({ username, email, password });
        await user.save();
        res.status(201).json(
            createResponse(201, "User registered successfully", path, "success")
        );
    } catch (error) {
        console.error("Register Error:", error);
        res.status(400).json(
            createResponse(400, "Error registering user", path, "error", {
                error: "server"
            })
        );
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const path = "/login";

    if (
        !username ||
        typeof username !== "string" ||
        username.length < 3 ||
        username.length > 20
    ) {
        return res
            .status(400)
            .json(
                createResponse(
                    400,
                    "Invalid username",
                    path,
                    "validation_error"
                )
            );
    }

    if (
        !password ||
        typeof password !== "string" ||
        password.length < 6 ||
        password.length > 50
    ) {
        return res
            .status(400)
            .json(
                createResponse(
                    400,
                    "Invalid password",
                    path,
                    "validation_error"
                )
            );
    }

    try {
        const user = await User.findOne({ username });
        if (!user || !(await user.matchPassword(password))) {
            return res
                .status(401)
                .json(
                    createResponse(
                        401,
                        "Invalid credentials",
                        path,
                        "unauthorized"
                    )
                );
        }

        const accessToken = jwt.sign(
            {
                userId: user._id,
                username: user.username
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        res.json(
            createResponse(200, "Login successful", path, "success", {
                accessToken,
                refreshToken
            })
        );
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json(
            createResponse(500, "Server error", path, "error")
        );
    }
});

router.post("/token", (req, res) => {
    const { token } = req.body;
    const path = "/token";

    if (!token)
        return res
            .status(401)
            .json(
                createResponse(401, "No token provided", path, "unauthorized")
            );

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
            return res
                .status(403)
                .json(createResponse(403, "Invalid token", path, "forbidden"));

        const accessToken = jwt.sign(
            {
                userId: user._id,
                username: user.username
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );
        res.json(
            createResponse(200, "Token refreshed", path, "success", {
                accessToken
            })
        );
    });
});

module.exports = router;
