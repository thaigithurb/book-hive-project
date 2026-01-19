const express = require("express");
const router = express.Router();

const controller = require("../controllers/auth.controller");

router.post("/register", controller.register);

router.post("/loginWithPassword", controller.loginWithPassword);

router.post("/refresh", controller.refresh);

router.post("/verify", controller.verify);

module.exports = router;

export {};
