const express = require("express");
const router = express.Router();

const controller = require("../controllers/order.controller");

router.get("/", controller.index);

router.post("/create", controller.create);

router.get("/detail/:orderCode", controller.detail);

router.patch("/detail/:orderCode/payment", controller.confirmPayment);

module.exports = router;

export {};
