const express = require("express");
const router = express.Router();

const controller = require("../controllers/order.controller");
const { validateCheckout } = require("../../../../middleware/validate.middleware")

router.get("/", controller.index);

router.post("/create", validateCheckout, controller.create);

router.get("/detail/:orderCode", controller.detail);

module.exports = router;

export {};
