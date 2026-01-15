const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  orderCode: {
    type: String,
    required: true,
    unique: true,
  },
  bankCode: {
    type: String,
    required: true,
  },
  accountNo: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  transactionDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["success", "pending", "failed"],
    default: "pending",
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model(
  "Transaction",
  transactionSchema,
  "transactions"
);

module.exports = Transaction;

export {};
