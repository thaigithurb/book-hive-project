const express = require("express");
const router = express.Router();

const controller = require("../controllers/role.controller");

router.get("/", controller.index);

router.post("/create", controller.create);

// router.patch("/edit", controller.edit);

router.get("/permissions", controller.permissions);

router.patch("/permissions/edit", controller.permissionsEdit);

module.exports = router;

export {};
