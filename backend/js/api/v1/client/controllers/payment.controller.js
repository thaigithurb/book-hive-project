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
const Rental = require("../../models/rental.model");
const Transaction = require("../../models/transaction.model");
const { sendOrderConfirmationEmail } = require("../../../../helpers/sendEmail");
const payOS = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});
const findDocumentByCode = (code) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔍 Tìm document với code:", code);
    let document = yield Order.findOne({ orderCode: String(code) });
    console.log("✅ Order findOne:", document ? "Tìm được" : "Không tìm được");
    if (document)
        return { document, type: "order" };
    document = yield Rental.findOne({ rentalCode: String(code) });
    console.log("✅ Rental findOne:", document ? "Tìm được" : "Không tìm được");
    if (document)
        return { document, type: "rent" };
    return { document: null, type: null };
});
module.exports.createPaymentLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, amount, description, items } = req.body;
        console.log("📤 Nhận request với code:", code);
        const { document, type } = yield findDocumentByCode(code);
        if (!document) {
            console.log("❌ Không tìm được document");
            const allOrders = yield Order.find().select("orderCode status").limit(5);
            console.log("Orders trong DB:", allOrders.map((o) => o.orderCode));
            return res.status(404).json({
                error: -1,
                message: "Không tìm thấy đơn hàng!",
                debug: {
                    searchCode: code,
                    foundOrders: allOrders.map((o) => o.orderCode),
                },
            });
        }
        console.log("✅ Tìm được document:", type, document._id);
        if (document.isExpired ||
            (document.expiredAt && new Date() > document.expiredAt)) {
            document.status = "cancelled";
            document.isExpired = true;
            yield document.save();
            return res.status(400).json({
                error: -1,
                message: `${type === "rent" ? "Đơn thuê" : "Đơn hàng"} đã hết hạn`,
            });
        }
        if (document.checkoutUrl) {
            return res.json({
                error: 0,
                message: "Link đã tồn tại",
                data: {
                    checkoutUrl: document.checkoutUrl,
                    code: code,
                },
            });
        }
        const cancelUrl = type === "rent"
            ? `${process.env.FRONTEND_URL || "http://localhost:3000"}/cart`
            : `${process.env.FRONTEND_URL || "http://localhost:3000"}/cart`;
        const returnUrl = type === "rent"
            ? `${process.env.FRONTEND_URL || "http://localhost:3000"}/rental-success?code=${code}`
            : `${process.env.FRONTEND_URL || "http://localhost:3000"}/order-success?code=${code}`;
        const paymentLink = yield payOS.paymentRequests.create({
            orderCode: Number(String(code).replace(/\D/g, "")),
            amount: Number(amount),
            description,
            items: items || [],
            cancelUrl,
            returnUrl,
        });
        document.checkoutUrl = paymentLink.checkoutUrl;
        yield document.save();
        return res.json({
            error: 0,
            message: "Tạo link thanh toán thành công",
            data: {
                checkoutUrl: paymentLink.checkoutUrl,
                code: code,
            },
        });
    }
    catch (err) {
        console.error("❌ Lỗi tạo link:", err);
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
        console.log("🔔 Webhook nhận:", { code, desc });
        if (code === "00" && desc === "success") {
            const { document, type } = yield findDocumentByCode(data.orderCode);
            if (document && document.status === "pending") {
                document.status = "paid";
                if (type === "rent") {
                    document.rentedAt = new Date();
                }
                yield document.save();
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
                console.log("✅ Thanh toán thành công!");
                if (type === "order") {
                    try {
                        yield sendOrderConfirmationEmail(document.userInfo.email, document.orderCode);
                    }
                    catch (emailErr) {
                        console.error("⚠️ Lỗi gửi email:", emailErr);
                    }
                }
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
        const { code } = req.params;
        console.log("❌ Cancel request với code:", code);
        const { document, type } = yield findDocumentByCode(code);
        if (!document) {
            return res.status(404).json({
                error: -1,
                message: "Không tìm thấy đơn hàng!",
            });
        }
        if (document.status === "paid") {
            return res.status(400).json({
                error: -1,
                message: "Đã thanh toán, không thể hủy",
            });
        }
        document.status = "cancelled";
        document.isExpired = true;
        yield document.save();
        try {
            const orderCode = Number(String(code).replace(/\D/g, ""));
            yield payOS.paymentRequests.cancel(orderCode);
        }
        catch (e) {
            console.log("⚠️ Không hủy được trên PayOS:", e.message);
        }
        return res.json({
            error: 0,
            message: "Hủy thành công",
        });
    }
    catch (err) {
        console.error("❌ Lỗi hủy:", err);
        return res.status(500).json({
            error: -1,
            message: "Lỗi hủy",
        });
    }
});
