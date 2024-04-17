const express = require("express");
/* MongoDB Connection Package  */
const mongoose = require('mongoose');
/* Token Generation & Verification Package */
const jwt = require("jsonwebtoken");
/* Express Router */
const router = express.Router();

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

/* API Endpoints */
router.get("/register", (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;
    if (!username || !email || !password || !firstName || !lastName) {
        return res.sendStatus(400);
    }

    /*
        - Check if username is used already
        - Check if email is used already
        - Check if password meets requirements
        - Generate userId
        - Save to MongoDB
        - Send Login Request
        - Status 200
    */
    //
});

router.post("/login", (req, res) => {
    const { username, email, password } = req.body;
    if ((username || email) || !password) {
        return res.sendStatus(400);
    }
    
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

router.delete("/logout", (req, res) => {
    if (!req.session.token) return res.sendStatus(404);

    req.session.destroy((error) => {
        if (error) return res.sendStatus(500);
        return res.sendStatus(200);
    });
});


module.exports = router;