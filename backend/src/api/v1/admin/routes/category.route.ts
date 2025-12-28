const express = require("express");
const router = express.Router();

const controller = require("../controllers/category.controller");

router.get("/", controller.index);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.patch("/delete/:id", controller.delete);

router.post("/create", controller.create);

router.get("/:slug", controller.getBySlug);

router.patch("/edit/:slug", controller.edit);

module.exports = router;

export {};
