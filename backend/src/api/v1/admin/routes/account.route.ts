const express = require("express");
const router = express.Router();

const controller = require("../controllers/account.controller");
const uploadImageHelper = require("../../../../helpers/uploadImage");

router.get("/", controller.index);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.patch("/change-multi", controller.changeMulti);

router.post("/create", uploadImageHelper.single("image"), controller.create);

router.get("/detail/:slug", controller.detail);

router.patch(
  "/edit/:slug",
  uploadImageHelper.single("image"),
  controller.edit
);

router.patch("/delete/:id", controller.delete);

router.patch("/reset-password/:slug", controller.resetPassword);

module.exports = router;

export {};
