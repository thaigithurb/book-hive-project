const express = require("express");
const router = express.Router();
const controller  = require("../controllers/payment.controller");

router.post('/create', controller.createPaymentLink);

router.post('/webhook', controller.receiveWebhook);

router.post("/verify", controller.verifyPayment);

router.get("/info", controller.getPaymentInfo);

module.exports = router;

export {};