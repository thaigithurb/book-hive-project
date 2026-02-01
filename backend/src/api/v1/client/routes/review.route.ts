const express = require("express");
const router = express.Router();

const controller = require("../controllers/review.controller");

router.post("/send", controller.sendReview);


module.exports = router;

export {};
