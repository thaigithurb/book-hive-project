"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const priceRentOptionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["day", "week"],
        required: true,
    },
    days: { type: Number, required: true },
    price: { type: Number, required: true },
}, { _id: false });
const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    category_id: String,
    description: String,
    priceBuy: {
        type: Number,
        default: 0,
    },
    priceRentOptions: {
        type: [priceRentOptionSchema],
        default: [],
    },
    rating: {
        type: Number,
        default: 0,
    },
    reviews: {
        type: Number,
        default: 0,
    },
    image: String,
    position: Number,
    status: {
        type: String,
        default: "active",
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    featured: Boolean,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    deletedAt: Date,
    slug: { type: String, required: true, unique: true },
}, {
    timestamps: true,
});
const Book = mongoose.model("Book", bookSchema, "books");
module.exports = Book;
