const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
/* Middleware Imports */
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
/* API Automatic Documentation Endpoint */
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/swagger.json");
/* Token Authentication Function */
const { authenticateToken } = require("./modules/authentication");
/* Express App */
const app = express();


/* Variables & Constants */
const PORT = process.env.PORT || 3000;

/* API Logging Function */
const logRequest = (req, res, next) => {
    let date = new Date()
    console.log(`[${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] ${req.method} ${req.path}`);
    next();
};

/* Middleware(s) */
app.use(logRequest);
app.use(cookieParser());
app.use(cors({
    /* Allow all site origins to request. */
    origin: "*"
}));
app.use(session({
    /* Secure secret key to sign the session ID cookie */
    secret: "2xrjrVgxkqKF62f86ZiHoZKOfOqGd0wqCPMk3qu35mojOyVLBF8uOwhHL3iokqkU",
    resave: true,
    saveUninitialized: true
}));

/* Main Endpoints */
app.get("/", (req, res) => {
    return res.sendFile(path.join(`${__dirname}\\static\\index.html`));
});

app.get("/dashboard", authenticateToken, (req, res) => {
    return res.sendFile(path.join(`${__dirname}\\static\\dashboard.html`));
});

app.get("/index.css", (req, res) => {
    return res.sendFile(path.join(`${__dirname}\\styles\\index.css`));
});

/* Route File Endpoints */
const route = require("./routes/route");
app.use("/api", route);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


/* Express Endpoints Listen */
app.listen(PORT, () => console.log(`alive on http://localhost:${PORT}`));