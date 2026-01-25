const express = require("express");
const router = express.Router();

const controller = require("../controllers/rental.controller");
const { validateCheckout } = require("../../../../middleware/validate.middleware")

// router.get("/", controller.index);

router.post("/create", validateCheckout, controller.createRental);

router.post("/detail/:rentalCode", validateCheckout, controller.createRental);

module.exports = router;

export {};
