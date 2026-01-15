"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
router.get("/info", paymentController.getPaymentInfo);
router.post("/verify", paymentController.verifyPayment);
router.post("/webhook", paymentController.webhookPayment);
module.exports = router;
