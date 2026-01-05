"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
module.exports.generateRefreshToken = () => {
    return crypto.randomBytes(64).toString("hex");
};
