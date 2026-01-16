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
    const paymentData = {
        orderCode: Number(orderCode),
        amount: Number(amount),
        description: description,
        items: items || [],
        cancelUrl: "http://localhost:3000/cart",
        returnUrl: "http://localhost:3000/order-success",
    };
    try {
        const paymentLink = yield payOS.paymentRequests.create(paymentData);
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
        return res.status(500).json({
            error: -1,
            message: "Lỗi tạo link",
            details: err.message,
        });
    }
});
module.exports.webhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const webhookData = yield payOS.webhooks.verify(req.body);
        const orderCode = webhookData.orderCode || ((_a = webhookData.data) === null || _a === void 0 ? void 0 : _a.orderCode);
        if (orderCode) {
            const order = yield Order.findOneAndUpdate({ orderCode: Number(orderCode) }, { status: "paid" });
            const transaction = new Transaction({
                orderCode: String(orderCode),
                bankCode: webhookData.counterAccountBankId ||
                    ((_b = webhookData.data) === null || _b === void 0 ? void 0 : _b.counterAccountBankId) ||
                    "PAYOS",
                accountNo: webhookData.accountNumber || ((_c = webhookData.data) === null || _c === void 0 ? void 0 : _c.accountNumber) || "",
                amount: webhookData.amount || ((_d = webhookData.data) === null || _d === void 0 ? void 0 : _d.amount) || 0,
                description: webhookData.description ||
                    ((_e = webhookData.data) === null || _e === void 0 ? void 0 : _e.description) ||
                    "Thanh toan",
                transactionDate: webhookData.transactionDateTime
                    ? new Date(webhookData.transactionDateTime)
                    : new Date(),
                status: "success",
                verifiedAt: new Date(),
            });
            yield transaction.save();
            if (order) {
                yield sendOrderConfirmationEmail(order);
            }
        }
        res.status(200).send("Chạy vào webhook");
    }
    catch (error) {
        res.status(400).send("Invalid webhook");
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
        yield Order.findOneAndUpdate({ orderCode: Number(orderCode) }, { status: "cancelled" });
        res.json({
            error: 0,
            message: "Hủy link thanh toán thành công",
        });
    }
    catch (err) {
        res.status(500).json({
            error: -1,
            message: "Lỗi hủy link thanh toán",
        });
    }
});
