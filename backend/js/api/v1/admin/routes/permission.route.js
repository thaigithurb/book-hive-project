"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permission.controller');
router.get('/', permissionController.index);
module.exports = router;
