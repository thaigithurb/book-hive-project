const express = require("express");
const router = express.Router();

const controller = require("../controllers/cart.controller");

router.get("/", controller.index);

router.post("/add-item", controller.add);

router.delete("/delete/:id", controller.deleteItem);

module.exports = router;

export {};
