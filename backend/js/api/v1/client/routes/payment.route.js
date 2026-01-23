"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const controller = require("../controllers/payment.controller");
router.post("/create", controller.createPaymentLink);
router.post("/webhook", express.json(), controller.webhook);
router.post("/cancel/:code", controller.cancelPaymentLink);
module.exports = router;
