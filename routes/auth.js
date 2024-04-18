const express = require("express");
/* MongoDB Connection Package  */
const mongoose = require("mongoose");
const User = require("../models/user");
const runDBConnection = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/authentication-backend");
        if (!User.exists()) {
            await User.createCollection();
        }
    } catch (error) {
        console.error(`[ERROR]: ${error}`);
    }    
}
/* Token Generation & Authentication Functions */
const { generateAccessToken, authenticateToken } = require("../modules/authentication");
/* Hasing Function */
const { createHash } = require("crypto");
const sha256 = (content) => createHash("sha256").update(content).digest("hex");
/* Express Router */
const router = express.Router();
runDBConnection();

/* Variables & Constants */
const JWT_SECRET = "iSxILagNCfvu2jGQcrt7glDSZgC9pT4KNNxevrndjoQRJRxHAZDwc6xdpSHUyfA6";
const JWT_OPTIONS = {expiresIn: "1h"};

/* Middleware(s) */




const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[0-9].*[0-9])[a-zA-Z0-9]{8}$/;
    return passwordRegex.test(password);
};

/* API Endpoints */
router.post("/register", async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;
    /* Validation for required fields */
    if (!username || !email || !password || !firstName || !lastName) {
        return res.sendStatus(400);
    }

    try {
        const doesUsernameExist = await User.findOne({ username: username });
        const doesEmailExist = await User.findOne({ email: email });

        if (doesUsernameExist || doesEmailExist) {
            return res.status(400).send({ success: false, message: `The ${doesUsernameExist ? "username" : "email"} is already taken.` });
        }
    } catch (error) {
        console.error("[ERROR] Error checking for existing username or email:", error);
        return res.status(500).send({ success: false, message: "Internal Server Error." });
    }

    if (!validatePassword(password)) {
        return res.status(400).send({ success: false, message: "The password must be atleast 8 letters long and two numbers."});
    }
    
    /* Saving the hashed password as password */
    password = sha256(password);
    try {
        /* Create the User in MongoDB */
        const newUser = await User.create(req.body);
        /* Generate a JWT ACCESS_TOKEN */
        const token = generateAccessToken({
            userId: newUser.userId,
            username: username,
            email: email,
            firstName: firstName,
            lastName: lastName
        }, (error, jwtToken) => {
            if (error) return res.status(500).send({ success: false, message: "Internal Server Error while generating Access Token." });
            return jwtToken;
        });

        /* Save the ACCESS_TOKEN */
        req.session.ACCESS_TOKEN = token;
        req.session.save();
        
        /* Send Status Response "Created" with the user data */
        res.status(201).json({
            userId: newUser.userId,
            username: username,
            email: email,
            firstName: firstName,
            lastName: lastName
        });
    } catch (error) {
        console.warn(`[ERROR]: ${error}`);
        res.status(500).json({ success: false, message: "An error occurd while registering the user." });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if ( !username || !password ) return res.sendStatus(400);

    
    /* 
        - Hash generation and comparison of password
            - Throw Status Error if not same password
        - Token generation if password is same
        - Set Token
        - Send Status 200
    */
    try {
        const user = await User.findOne({
            username: username
        });
        if (!user) return res.status(404).send({ success: false, message: "The user doesn't exist."});

        let hashed_password = sha256(password);

        if (user.password !== hashed_password) return res.status(401).send({ success: false, message: "The password is invalid!"});

        /* Generate a JWT ACCESS_TOKEN */
        const token = generateAccessToken({
            userId: newUser.userId,
            username: newUser.username,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName
        }, (error, jwtToken) => {
            if (error) return res.status(500).send({ success: false, message: "Internal Server Error while generating Access Token." });
            return jwtToken;
        });
    
        /* Save the ACCESS_TOKEN */
        req.session.ACCESS_TOKEN = token;
        req.session.save();

        res.status(200).redirect(`${req.baseUrl}/dashboard`);
    } catch (error) {
        console.warn(`[ERROR]: ${error}`);
        res.status(500).json({ success: false, message: "An error occurd while logging in." });
    }
});

router.get("/verify", authenticateToken, (req, res) => {
    return res.sendStatus(200);
});

router.all("/logout", (req, res) => {
    if (!req.session.token) return res.sendStatus(404);

    req.session.destroy((error) => {
        if (error) return res.sendStatus(500);
        return res.sendStatus(200);
    });
});


module.exports = router;