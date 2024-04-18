const express = require("express");
const bodyParser = require("body-parser");
/* Express Router */
const router = express.Router();
router.get("/", (req, res) => res.sendStatus(200));

/* Middleware(s) */
router.use(bodyParser.json());

/* API Endpoints */
const auth = require("./auth");
router.use("/auth", auth);


module.exports = router;