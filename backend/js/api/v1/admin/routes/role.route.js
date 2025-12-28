"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const controller = require("../controllers/role.controller");
router.get("/", controller.index);
router.get("/permissions", controller.permissions);
module.exports = router;
