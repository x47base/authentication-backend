const express = require("express");
const router = express.Router();
router.get("/", (req, res) => res.sendStatus(200));

/* Middleware(s) */


/* API Endpoints */
const auth = require("./auth");
router.use("/auth", auth);


module.exports = router;