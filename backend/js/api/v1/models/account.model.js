"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const accountSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    refreshToken: {
        type: String,
        default: null,
    },
    refreshTokenExpiresAt: {
        type: Date,
    },
    phone: String,
    avatar: String,
    role_id: String,
    status: String,
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
    slug: { type: String, required: true, unique: true },
}, {
    timestamps: true,
});
const Account = mongoose.model("Account", accountSchema, "accounts");
module.exports = Account;
