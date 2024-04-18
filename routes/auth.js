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
    } catch(error) {
        console.error(`[ERROR]: ${error}`);
    }    
}
/* Token Generation & Verification Package */
const jwt = require("jsonwebtoken");
/* Hasing Function */
const { createHash } = require('crypto');
const sha256 = (content) => createHash('sha256').update(content).digest('hex');
/* Express Router */
const router = express.Router();
runDBConnection();

/* Variables & Constants */
const JWT_SECRET = "iSxILagNCfvu2jGQcrt7glDSZgC9pT4KNNxevrndjoQRJRxHAZDwc6xdpSHUyfA6";
const JWT_OPTIONS = {expiresIn: "1h"};

/* Middleware(s) */


/* Token Generation & Authentication Functions */
const generateAccessToken = (payload, callback) => {
    return jwt.sign(payload, JWT_SECRET, JWT_OPTIONS, callback);
};

const verifyAccessToken = (token) => {
    try {
        const decoded = JWT.verify(token, JWT_SECRET);
        return { success: true, data: decoded };
    } catch(error) {
        return { success: false, error: error.message };
    }
};

const authenticateToken = (req, res, next) => {
    const token = req.session.token;
    
    if (!token) return res.sendStatus(401);

    const result = verifyAccessToken(token);

    if (!result.success) return res.sendStatus(403);

    next();
};

const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[0-9].*[0-9])[a-zA-Z0-9]{8}$/;
    return passwordRegex.test(password);
};

/* API Endpoints */
router.get("/register", async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;
    if (!username || !email || !password || !firstName || !lastName) {
        return res.sendStatus(400);
    }

    const doesusernameexist = User.findOne({username: username});
    const doesemailexist = User.find({email: email});
    
    if (doesusernameexist || doesemailexist) return res.status(400).send({ success: false, message: `The ${doesusernameexist ? "username" : "email"} is already taken.`});

    if (!validatePassword(password)) return res.status(400).send({ success: false, message: "The password must be atleast 8 letters long and two numbers."})
    
    password = sha256(password);
    try {
        const newUser = await User.create(req.body);
        const _userId = await User.findOne({
            $and : {
                username: username,
                email: email
            }
        });
        res.status(201).json(newUser);
        const token = generateAccessToken({
            userId: _userId,
            username: username,
            email: email,
            firstName: firstName,
            lastName: lastName
        }, (error, jwtToken) => {

        })
    } catch (error) {
        console.warn(`[ERROR]: ${error}`);
        res.status(500).json({ success: false, message: "An error occurd while registering the user." });
    }


});

router.post("/login", (req, res) => {
    const { username, email, password } = req.body;
    if ( !username || !password ) return res.sendStatus(400);

    
    /* 
        - Hash generation and comparison of password
            - Throw Status Error if not same password
        - Token generation if password is same
        - Set Token
        - Send Status 200
    */
    //
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