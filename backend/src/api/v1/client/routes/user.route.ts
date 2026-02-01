const express = require("express");
const router = express.Router();

const controller = require("../controllers/user.controller");

router.get("/", controller.index);

router.patch("/edit", controller.edit);

router.get("/me", controller.getUser);

module.exports = router;

export {};
