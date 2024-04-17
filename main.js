const express = require("express");
/* Middleware Imports */
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const sessions = require("express-session");
/* API Automatic Documentation Endpoint */
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/swagger.json");
/* Fetch Function Import */
const fetch = (...args) => import("node-fetch").then(({
    default: fetch
}) => fetch(...args));
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
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    /* Allow all site origins to request. */
    origin: "*"
}));
app.use(sessions({
    /* Secure secret key to sign the session ID cookie */
    secret: "2xrjrVgxkqKF62f86ZiHoZKOfOqGd0wqCPMk3qu35mojOyVLBF8uOwhHL3iokqkU",
    cookie: {
        sameSite: "none"
    },
    resave: true,
    saveUninitialized: true
}));

/* Main Endpoints */
app.get("/", (req, res) => {
    return res.sendFile(path.join(`${__dirname}\\static\\index.html`));
})

/* Route File Endpoints */
const route = require("./routes/route");
app.use("/api", route);

/* Express Endpoints Listen */
app.listen(PORT, () => console.log(`alive on http://localhost:${PORT}`));