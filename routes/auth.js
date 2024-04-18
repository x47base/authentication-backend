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
const BASE_URL = `http://localhost:3000`;

/* Middleware(s) */


/* Other Functions */
const validatePassword = (password) => {
    let return_bool = false;
    if (password.length > 8) return_bool = true;
    const passwordRegex = /\d/;
    if (!passwordRegex.test(password)) return_bool = false;
    return return_bool;
};

/* API Endpoints */
router.post("/register", async (req, res) => {
    res.contentType("application/json");
    let { username, email, password, firstName, lastName } = req.body;
    /* Validation for required fields */
    if (!username || !email || !password || !firstName || !lastName) {
        return res.status(400).send({ success: false, message: "No body given."});
    }

    try {
        const doesUsernameExist = await User.findOne({ username: username });
        const doesEmailExist = await User.findOne({ email: email });

        if (doesUsernameExist || doesEmailExist) {
            return res.status(400).send({ success: false, message: `The ${doesUsernameExist ? "username" : "email"} is already taken.` });
        }
    } catch (error) {
        console.error(`[ERROR] ${error}`);
        return res.status(500).send({ success: false, message: "Internal Server Error." });
    }

    if (!validatePassword(password)) {
        return res.status(400).send({ success: false, message: "The password must be atleast 8 letters long and two numbers."});
    }
    
    /* Saving the hashed password as password */
    const hashed_password = sha256(password);
    try {
        /* Create the User in MongoDB */
        const DATA = {
            username: username,
            email: email,
            password: hashed_password,
            firstName: firstName,
            lastName: lastName
        }
        const newUser = await User.create(DATA);
        /* Generate a JWT ACCESS_TOKEN */
        const token = generateAccessToken({
            userId: newUser.userId,
            username: username,
            email: email,
            firstName: firstName,
            lastName: lastName
        });

        /* Save the ACCESS_TOKEN */
        let tries = 0;
        while (!req.session.ACCESS_TOKEN && tries < 3) {
            req.session.ACCESS_TOKEN = token;
            req.session.save();
            tries++;
        }
        
        /* Send Status Response "Created" with the user data */
        return res.status(201).send({
            userId: newUser.userId,
            username: username,
            email: email,
            firstName: firstName,
            lastName: lastName
        });
    } catch (error) {
        console.warn(`[ERROR]: ${error}`);
        return res.status(500).send({ success: false, message: "An error occurd while registering the user." });
    }
});

router.post("/login", async (req, res) => {
    res.contentType("application/json");
    const { username, password } = req.body;
    if ( !username || !password ) return res.status(400).send({ success: false, message: "Missing parameters."});
    
    try {
        const user = await User.findOne({
            username: username
        });
        if (!user) return res.status(404).send({ success: false, message: "The user does not exist."});

        let hashed_password = sha256(password);

        if (user.password !== hashed_password) return res.status(401).send({ success: false, message: "The password is invalid!"});

        /* Generate a JWT ACCESS_TOKEN */
        const token = generateAccessToken({
            userId: user.userId,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        });
    
        /* Save the ACCESS_TOKEN (max 3 tries) */
        let tries = 0;
        while (!req.session.ACCESS_TOKEN && tries < 3) {
            req.session.ACCESS_TOKEN = token;
            req.session.save();
            tries++;
        }

        return res.status(200).redirect(`${BASE_URL}/dashboard`);
    } catch (error) {
        console.warn(`[ERROR]: ${error}`);
        return res.status(500).send({ success: false, message: "An error occurd while logging in." });
    }
});

router.get("/verify", authenticateToken, (req, res) => {
    return res.sendStatus(200);
});

router.delete("/logout", (req, res) => {
    if (!req.session.ACCESS_TOKEN) return res.sendStatus(404);

    req.session.destroy((error) => {
        if (error) return res.sendStatus(500);
        return res.sendStatus(200);
    });
});


module.exports = router;