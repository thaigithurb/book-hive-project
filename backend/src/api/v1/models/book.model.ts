const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: String,
    author: String,
    category_id: String,
    description: String,
    priceBuy: {
      type: Number,
      default: 0,
    },
    priceRent: {
      type: Number,
      default: 0,
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
    deletedAt: Date,
    slug: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model("Book", bookSchema, "books");

module.exports = Book;

export {};
