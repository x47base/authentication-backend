/* Token Generation & Verification Package */
const jwt = require("jsonwebtoken");

/* Constants */
const JWT_SECRET = "iSxILagNCfvu2jGQcrt7glDSZgC9pT4KNNxevrndjoQRJRxHAZDwc6xdpSHUyfA6";
const JWT_OPTIONS = {expiresIn: "1h"};

/* Token Generation & Authentication Functions */
const generateAccessToken = (payload, callback) => {
    return jwt.sign(payload, JWT_SECRET, JWT_OPTIONS, callback);
};

const verifyAccessToken = (token) => {
    try {
        const decoded = JWT.verify(token, JWT_SECRET);
        return { success: true, data: decoded };
    } catch (error) {
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

module.exports = {
    generateAccessToken,
    verifyAccessToken,
    authenticateToken
};