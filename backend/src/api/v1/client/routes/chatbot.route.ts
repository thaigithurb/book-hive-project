const express = require("express");
const router = express.Router();

const controller = require("../controllers/chatbot.controller");

// [POST] /api/v1/chatbot/query
router.post("/query", controller.query);

module.exports = router;

export {};
