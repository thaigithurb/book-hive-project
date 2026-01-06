const express = require("express");
const router = express.Router();

const controller = require("../controllers/auth.controller");

router.post("/login", controller.login);

router.post("/refresh", controller.refresh);

router.post("/verify", controller.verify);

router.post("/logout", controller.logout);

module.exports = router;

export {};
