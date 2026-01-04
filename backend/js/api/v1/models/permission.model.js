"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const permissionSchema = new mongoose.Schema({
    key: String,
    label: String,
    group: String,
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
    slug: { type: String, required: true, unique: true },
}, {
    timestamps: true,
});
const Permission = mongoose.model("Permission", permissionSchema, "permissions");
module.exports = Permission;
