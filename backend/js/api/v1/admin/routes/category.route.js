"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const controller = require("../controllers/category.controller");
router.get("/", controller.index);
router.patch("/change-status/:status/:id", controller.changeStatus);
module.exports = router;
