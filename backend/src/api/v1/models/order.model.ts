const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderCode: {
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
    enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;

export {};
