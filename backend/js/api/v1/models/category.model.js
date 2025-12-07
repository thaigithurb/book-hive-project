"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
    title: String,
    parent_id: {
        type: String,
        default: "",
    },
    description: String,
    thumbnail: String,
    status: {
        type: String,
        default: "active",
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
    slug: { type: String, required: true, unique: true },
}, {
    timestamps: true,
});
const Category = mongoose.model("Category", categorySchema, "categories");
module.exports = Category;
