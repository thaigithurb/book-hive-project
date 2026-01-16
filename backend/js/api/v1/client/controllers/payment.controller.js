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
const { PayOS } = require("@payos/node");
const Order = require("../../models/order.model");
const Transaction = require("../../models/transaction.model");
const { sendOrderConfirmationEmail } = require("../../../../helpers/sendEmail");
const payOS = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});
module.exports.createPaymentLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderCode, amount, description, items } = req.body;
    try {
        const existingOrder = yield Order.findOne({ orderCode: Number(orderCode) });
        if (!existingOrder) {
            return res.status(404).json({
                error: -1,
                message: "Không tìm thấy đơn hàng",
            });
        }
        const now = new Date();
        if (existingOrder.expiredAt && now > existingOrder.expiredAt) {
            existingOrder.isExpired = true;
            existingOrder.status = "cancelled";
            yield existingOrder.save();
            return res.status(400).json({
                error: -1,
                message: "Đơn hàng đã hết hạn",
            });
        }
        if (existingOrder.checkoutUrl) {
            return res.json({
                error: 0,
                message: "Link thanh toán đã tồn tại",
                data: {
                    checkoutUrl: existingOrder.checkoutUrl,
                    orderCode: existingOrder.orderCode,
                },
            });
        }
        const paymentData = {
            orderCode: Number(orderCode),
            amount: Number(amount),
            description: description,
            items: items || [],
            cancelUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/cart`,
            returnUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/order-success`,
        };
        const paymentLink = yield payOS.paymentRequests.create(paymentData);
        existingOrder.checkoutUrl = paymentLink.checkoutUrl;
        yield existingOrder.save();
        return res.json({
            error: 0,
            message: "Tạo link thành công",
            data: {
                checkoutUrl: paymentLink.checkoutUrl,
                orderCode: paymentLink.orderCode,
                paymentLinkId: paymentLink.paymentLinkId,
            },
        });
    }
    catch (err) {
        console.error("❌ Lỗi tạo payment link:", err);
        return res.status(500).json({
            error: -1,
            message: "Lỗi tạo link thanh toán",
            details: err.message,
        });
    }
});
module.exports.webhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const webhookData = req.body;
        if (webhookData.code === "00" && webhookData.desc === "success") {
            const orderCode = webhookData.data.orderCode;
            const order = yield Order.findOne({ orderCode: orderCode });
            if (order && order.status === "pending") {
                order.status = "paid";
                yield order.save();
                const transaction = new Transaction({
                    orderCode: String(orderCode),
                    bankCode: webhookData.data.counterAccountBankId || "PAYOS",
                    accountNo: webhookData.data.accountNumber || "",
                    amount: webhookData.data.amount || 0,
                    description: webhookData.data.description || "Thanh toán",
                    transactionDate: webhookData.data.transactionDateTime
                        ? new Date(webhookData.data.transactionDateTime)
                        : new Date(),
                    status: "success",
                    verifiedAt: new Date(),
                });
                yield transaction.save();
                yield sendOrderConfirmationEmail(order.userInfo.email, order.userInfo.fullName, order.orderCode, order.items, order.totalAmount);
                console.log("✅ Cập nhật trạng thái thành công:", orderCode);
            }
        }
        return res.json({ message: "Webhook xử lý thành công" });
    }
    catch (err) {
        console.error("❌ Lỗi xử lý webhook:", err);
        return res.status(500).json({ message: "Lỗi xử lý webhook" });
    }
});
module.exports.cancelPaymentLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderCode } = req.params;
        const order = yield Order.findOne({ orderCode: Number(orderCode) });
        if (!order) {
            return res.status(404).json({
                error: -1,
                message: "Không tìm thấy đơn hàng",
            });
        }
        if (order.status === "paid") {
            return res.status(400).json({
                error: -1,
                message: "Đơn hàng đã thanh toán, không thể hủy",
            });
        }
        order.status = "cancelled";
        order.isExpired = true;
        yield order.save();
        try {
            yield payOS.paymentRequests.cancel(Number(orderCode));
        }
        catch (cancelErr) {
            console.log("⚠️ Không hủy được trên PayOS:", cancelErr.message);
        }
        return res.json({
            error: 0,
            message: "Hủy đơn hàng thành công",
        });
    }
    catch (err) {
        console.error("❌ Lỗi hủy đơn:", err);
        return res.status(500).json({
            error: -1,
            message: "Lỗi hủy đơn hàng",
        });
    }
});
