const express = require("express");
const router = express.Router();
const controller = require("../controllers/payment.controller");

router.post("/create-combined", controller.createCombinedPaymentLink);

router.post("/webhook", express.json(), controller.webhook);

router.post("/cancel/:code", controller.cancelPaymentLink);

module.exports = router;

export {};