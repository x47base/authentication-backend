/* Token Generation & Verification Package */
const jwt = require("jsonwebtoken");

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