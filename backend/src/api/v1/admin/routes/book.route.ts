const express = require("express");
const router = express.Router();

const controller = require("../controllers/book.controller");
const uploadImageHelper = require("../../../../helpers/uploadImage");
const validateBook = require("../../../../middleware/validateBook.middleware");

router.get("/", controller.index);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.patch("/delete/:id", controller.delete);

router.post(
  "/create",
  uploadImageHelper.single("image"),
  validateBook,
  controller.create
);

router.get("/:slug", controller.getBySlug);

router.patch(
  "/edit/:slug",
  uploadImageHelper.single("image"),
  validateBook,
  controller.edit
);

router.get("/detail/:slug", controller.detail);

module.exports = router;

export {};
