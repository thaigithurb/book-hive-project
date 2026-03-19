"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const controller = require("../controllers/chatbot.controller");
router.post("/query", controller.query);
module.exports = router;
