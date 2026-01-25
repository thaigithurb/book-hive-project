"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const rentalSchema = new mongoose.Schema({
    rentalCode: {
        type: String,
        unique: true,
        required: true,
    },
    userInfo: {
        fullName: String,
        email: String,
        phone: String,
        address: String,
    },
    items: [
        {
            id: String,
            title: String,
            price: Number,
            quantity: Number,
            image: String,
            slug: String,
            rentalType: {
                type: String,
                enum: ["day", "week"],
                required: true,
            },
            rentalDays: Number,
        },
    ],
    totalAmount: Number,
    paymentMethod: {
        type: String,
        enum: ["transfer", "cod"],
        default: "transfer",
    },
    status: {
        type: String,
        enum: ["pending", "paid", "renting", "returned", "cancelled"],
        default: "pending",
    },
    rentedAt: {
        type: Date,
        default: null,
    },
    dueAt: {
        type: Date,
        default: null,
    },
    returnedAt: {
        type: Date,
        default: null,
    },
    lateFee: {
        type: Number,
        default: 0,
    },
    lateFeePaid: {
        type: Boolean,
        default: false,
    },
    checkoutUrl: {
        type: String,
        default: null,
    },
    expiredAt: {
        type: Date,
        default: () => new Date(Date.now() + 5 * 60 * 1000),
    },
    isExpired: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Rental = mongoose.model("Rental", rentalSchema, "rentals");
module.exports = Rental;
