const express = require("express");
const router = express.Router();

const controller = require("../controllers/book.controller");

router.get("/", controller.index);

router.get("/featured", controller.featured);

router.get("/detail/:bookSlug", controller.detail);

router.get("/rent-only", controller.booksRent);

router.get("/buy-only", controller.booksBuy);

module.exports = router;

export {};
