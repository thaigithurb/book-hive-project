const express = require("express");
const router = express.Router();

const controller = require("../controllers/favorite.controller");

router.get("/", controller.index);

router.post("/add", controller.addFavorite);

router.delete("/remove", controller.removeFavorite);

module.exports = router;

export {};
