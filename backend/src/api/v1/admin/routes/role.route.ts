const express = require("express");
const router = express.Router();

const controller = require("../controllers/role.controller");
const { validateRole, validatePermission } = require("../../../../middleware/validate.middleware");

router.get("/", controller.index);

router.post("/create", validateRole, controller.create);

router.get("/permissions", controller.permissions);

router.patch("/permissions/edit", validatePermission, controller.permissionsEdit);

router.get("/:id", controller.getById);

router.get("/detail/:slug", controller.detail);

router.patch("/edit/:slug", validateRole, controller.edit);

router.patch("/delete/:id", controller.delete);

router.patch("/change-multi", controller.changeMulti);

router.post("/permissions/create", validatePermission, controller.createPerm);

router.get("/permissions/detail/:slug", controller.detailPerm);

router.patch("/permissions/edit/:slug", controller.editPerm);

router.patch("/permissions/delete/:id", controller.deletePerm);

module.exports = router;

export {};
