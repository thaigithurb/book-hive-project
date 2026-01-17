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
    try {
        const { orderCode, amount, description, items } = req.body;
        const order = yield Order.findOne({ orderCode: String(orderCode) });
        if (!order) {
            return res
                .status(404)
                .json({ error: -1, message: "Không tìm thấy đơn hàng" });
        }
        if (order.expiredAt && new Date() > order.expiredAt) {
            order.status = "cancelled";
            order.isExpired = true;
            yield order.save();
            return res
                .status(400)
                .json({ error: -1, message: "Đơn hàng đã hết hạn" });
        }
        if (order.checkoutUrl) {
            return res.json({
                error: 0,
                message: "Link đã tồn tại",
                data: { checkoutUrl: order.checkoutUrl, orderCode: order.orderCode },
            });
        }
        const paymentLink = yield payOS.paymentRequests.create({
            orderCode: Number(orderCode),
            amount: Number(amount),
            description,
            items: items || [],
            cancelUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/cart`,
            returnUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/order-success`,
        });
        order.checkoutUrl = paymentLink.checkoutUrl;
        yield order.save();
        return res.json({
            error: 0,
            message: "Tạo link thành công",
            data: {
                checkoutUrl: paymentLink.checkoutUrl,
                orderCode: paymentLink.orderCode,
            },
        });
    }
    catch (err) {
        console.error("Lỗi tạo link:", err);
        return res.status(500).json({
            error: -1,
            message: "Lỗi tạo link thanh toán",
            details: err.message,
        });
    }
});
module.exports.webhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, desc, data } = req.body;
        if (code === "00" && desc === "success") {
            const order = yield Order.findOne({ orderCode: String(data.orderCode) });
            if (order && order.status === "pending") {
                order.status = "paid";
                yield order.save();
                yield new Transaction({
                    orderCode: String(data.orderCode),
                    bankCode: data.counterAccountBankId,
                    accountNo: data.accountNumber,
                    amount: data.amount,
                    description: data.description,
                    transactionDate: data.transactionDateTime
                        ? new Date(data.transactionDateTime)
                        : new Date(),
                    status: "success",
                    verifiedAt: new Date(),
                }).save();
                yield sendOrderConfirmationEmail(order.userInfo.email, order.userInfo.fullName, order.orderCode, order.items, order.totalAmount);
                console.log("Thanh toán thành công:", data.orderCode);
            }
        }
        return res.json({ message: "OK" });
    }
    catch (err) {
        console.error("❌ Lỗi webhook:", err);
        return res.status(500).json({ message: "Lỗi xử lý webhook" });
    }
});
module.exports.cancelPaymentLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order.findOne({
            orderCode: String(req.params.orderCode),
        });
        if (!order) {
            return res
                .status(404)
                .json({ error: -1, message: "Không tìm thấy đơn hàng" });
        }
        if (order.status === "paid") {
            return res
                .status(400)
                .json({ error: -1, message: "Đã thanh toán, không thể hủy" });
        }
        order.status = "cancelled";
        order.isExpired = true;
        yield order.save();
        try {
            yield payOS.paymentRequests.cancel(Number(req.params.orderCode));
        }
        catch (e) {
            console.log(" Không hủy được trên PayOS");
        }
        return res.json({ error: 0, message: "Hủy thành công" });
    }
    catch (err) {
        console.error("❌ Lỗi hủy:", err);
        return res.status(500).json({ error: -1, message: "Lỗi hủy đơn hàng" });
    }
});
