"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
    },
    items: [
        {
            bookId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Book",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1,
            },
            title: String,
            price: Number,
            image: String,
            slug: String,
            type: {
                type: String,
                enum: ["buy", "rent"],
                default: "buy",
            },
            rentalType: {
                type: String,
                enum: ["day", "week"],
                default: null,
            },
            rentalDays: {
                type: Number,
                default: null,
            },
        },
    ],
    deleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Cart = mongoose.model("Cart", cartSchema, "carts");
module.exports = Cart;
