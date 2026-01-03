const express = require("express");
const router = express.Router();

const controller = require("../controllers/role.controller");

router.get("/", controller.index);

router.post("/create", controller.create);

router.get("/permissions", controller.permissions);

router.patch("/permissions/edit", controller.permissionsEdit);

router.get("/:id", controller.getById);

router.patch("/edit/:slug", controller.edit);

router.patch("/delete/:id", controller.delete);

router.patch("/change-multi", controller.changeMulti);

router.post("/permissions/create", controller.createPerm);

module.exports = router;

export {};
