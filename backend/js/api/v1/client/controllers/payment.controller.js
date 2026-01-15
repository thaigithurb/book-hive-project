"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const payos = require("../../../../config/payos");
const Order = require("../../models/order.model");
const Transaction = require("../../models/transaction.model");
module.exports.createPaymentLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderCode, amount, description, items, returnUrl, cancelUrl } = req.body;
        if (!orderCode || !amount || !description) {
            return res.status(400).json({
                error: -1,
                message: "Thiếu thông tin bắt buộc!",
            });
        }
        const APP_URL = process.env.APP_URL || "http://localhost:3000";
        const body = {
            orderCode: Number(orderCode),
            amount: Number(amount),
            description: description,
            items: items || [
                {
                    name: description,
                    quantity: 1,
                    price: Number(amount),
                },
            ],
            cancelUrl: cancelUrl || `${APP_URL}/cart`,
            returnUrl: returnUrl || `${APP_URL}/order-success`,
        };
        console.log("🔗 Creating payment link:", body);
        const paymentLinkResponse = yield payos.createPaymentLink(body);
        console.log("✅ Payment link created:", paymentLinkResponse.checkoutUrl);
        const order = yield Order.create({
            orderCode: Number(orderCode),
            amount: Number(amount),
            description: description,
            items: items || [],
            status: "pending",
            paymentLinkId: paymentLinkResponse.id,
        });
        console.log("💾 Order saved:", order._id);
        return res.status(200).json({
            error: 0,
            message: "Tạo link thanh toán thành công",
            data: {
                orderCode: paymentLinkResponse.orderCode,
                checkoutUrl: paymentLinkResponse.checkoutUrl,
                paymentLinkId: paymentLinkResponse.id,
                amount: paymentLinkResponse.amount,
            },
        });
    }
    catch (error) {
        console.error("❌ Lỗi tạo link thanh toán:", error);
        return res.status(500).json({
            error: -1,
            message: "Lỗi tạo link thanh toán!",
        });
    }
});
module.exports.receiveWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const webhookBody = req.body;
        console.log("🔔 Webhook received:", JSON.stringify(webhookBody, null, 2));
        let webhookData;
        try {
            webhookData = payos.verifyPaymentWebhookData(webhookBody);
            console.log("✅ Webhook signature verified!");
            console.log("📊 Verified data:", webhookData);
        }
        catch (verifyError) {
            console.error("❌ Signature verification failed:", verifyError.message);
            return res.status(200).json({
                error: -1,
                message: "Signature verification failed",
            });
        }
        if (webhookData.desc !== "success" && webhookData.code !== "00") {
            console.log("⚠️ Giao dịch thất bại:", webhookData.desc);
            return res.status(200).json({
                error: 0,
                message: "Webhook xác nhận thành công",
                data: {
                    orderCode: webhookData.orderCode,
                    status: "failed",
                    desc: webhookData.desc,
                },
            });
        }
        console.log("💰 Processing successful transaction:", {
            orderCode: webhookData.orderCode,
            amount: webhookData.amount,
        });
        const existingTransaction = yield Transaction.findOne({
            orderCode: webhookData.orderCode,
        });
        if (existingTransaction) {
            console.log("⚠️ Transaction already exists");
            return res.status(200).json({
                error: 0,
                message: "Webhook xác nhận thành công",
                data: {
                    orderCode: webhookData.orderCode,
                    status: "duplicated",
                },
            });
        }
        const transaction = yield Transaction.create({
            orderCode: webhookData.orderCode,
            amount: webhookData.amount,
            description: webhookData.description,
            reference: webhookData.reference,
            transactionDateTime: webhookData.transactionDateTime,
            paymentLinkId: webhookData.paymentLinkId,
            accountNumber: webhookData.accountNumber,
            status: "success",
            metadata: webhookData,
        });
        console.log("💾 Transaction saved:", transaction._id);
        const updatedOrder = yield Order.findOneAndUpdate({ orderCode: webhookData.orderCode }, {
            status: "paid",
            paidAt: new Date(),
        }, { new: true });
        if (updatedOrder) {
            console.log("✅ Order updated to paid:", updatedOrder._id);
        }
        return res.status(200).json({
            error: 0,
            message: "Webhook xác nhận thành công",
            data: {
                orderCode: webhookData.orderCode,
                status: "success",
            },
        });
    }
    catch (error) {
        console.error("❌ Webhook error:", error.message);
        return res.status(200).json({
            error: -1,
            message: "Lỗi xử lý webhook",
        });
    }
});
module.exports.verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderCode } = req.body;
        if (!orderCode) {
            return res.status(400).json({
                error: -1,
                message: "Thiếu mã đơn hàng!",
            });
        }
        console.log("🔍 Verifying payment for orderCode:", orderCode);
        const transaction = yield Transaction.findOne({
            orderCode: Number(orderCode),
            status: "success",
        });
        if (transaction) {
            console.log("✅ Transaction found:", transaction._id);
            return res.status(200).json({
                error: 0,
                message: "Thanh toán thành công",
                data: {
                    orderCode,
                    amount: transaction.amount,
                    reference: transaction.reference,
                    transactionDateTime: transaction.transactionDateTime,
                },
            });
        }
        console.log("⏳ Webhook not received yet:", orderCode);
        return res.status(200).json({
            error: -1,
            message: "Không tìm thấy giao dịch...",
            orderCode,
        });
    }
    catch (error) {
        console.error("❌ Lỗi verify payment:", error);
        return res.status(500).json({
            error: -1,
            message: "Lỗi xác nhận thanh toán!",
        });
    }
});
module.exports.getPaymentInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentInfo = {
            bankName: process.env.PAYMENT_BANK_NAME || "MB Bank",
            accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER,
            accountHolder: process.env.PAYMENT_ACCOUNT_HOLDER,
        };
        console.log("📋 Payment info requested");
        return res.status(200).json({
            error: 0,
            message: "Lấy thông tin thanh toán thành công",
            data: paymentInfo,
        });
    }
    catch (error) {
        console.error("❌ Lỗi lấy thông tin thanh toán:", error);
        return res.status(500).json({
            error: -1,
            message: "Lỗi lấy thông tin thanh toán!",
        });
    }
});
