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
    let document = yield Order.findOne({ orderCode: String(code) });
    if (document)
        return { document, type: "order" };
    document = yield Rental.findOne({ rentalCode: String(code) });
    if (document)
        return { document, type: "rental" };
    return { document: null, type: null };
});
module.exports.createCombinedPaymentLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codes, amount, items } = req.body;
        if (!codes || codes.length === 0) {
            return res.status(400).json({
                error: -1,
                message: "Không có mã đơn hàng!",
            });
        }
        const documents = [];
        for (const code of codes) {
            const { document, type } = yield findDocumentByCode(code);
            if (document) {
                documents.push({ code, document, type });
            }
        }
        if (documents.length === 0) {
            return res.status(404).json({
                error: -1,
                message: "Không tìm thấy đơn hàng nào!",
            });
        }
        for (const doc of documents) {
            if (doc.document.isExpired ||
                (doc.document.expiredAt && new Date() > doc.document.expiredAt)) {
                doc.document.status = "cancelled";
                doc.document.isExpired = true;
                yield doc.document.save();
                const typeLabel = doc.type === "rental" ? "Đơn thuê" : "Đơn hàng";
                return res.status(400).json({
                    error: -1,
                    message: `${typeLabel} ${doc.code} đã hết hạn`,
                });
            }
        }
        const mainCode = codes[0];
        const cancelUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/cart`;
        const returnUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/order-success`;
        const paymentLink = yield payOS.paymentRequests.create({
            orderCode: Number(String(mainCode).replace(/\D/g, "")),
            amount: Number(amount),
            description: `Thanh toán ${documents.length} đơn hàng`,
            items: items || [],
            cancelUrl,
            returnUrl,
        });
        for (const doc of documents) {
            doc.document.checkoutUrl = paymentLink.checkoutUrl;
            yield doc.document.save();
        }
        console.log(`✅ Tạo combined payment link thành công cho ${codes.length} đơn`);
        return res.json({
            error: 0,
            message: "Tạo link thanh toán thành công",
            data: {
                checkoutUrl: paymentLink.checkoutUrl,
                codes: codes,
                amount: amount,
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
module.exports.createPaymentLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, amount, description, items } = req.body;
        const { document, type } = yield findDocumentByCode(code);
        if (!document) {
            console.log("❌ Không tìm được document với code:", code);
            return res.status(404).json({
                error: -1,
                message: "Không tìm thấy đơn hàng!",
            });
        }
        if (document.isExpired ||
            (document.expiredAt && new Date() > document.expiredAt)) {
            document.status = "cancelled";
            document.isExpired = true;
            yield document.save();
            const typeLabel = type === "rental" ? "Đơn thuê" : "Đơn hàng";
            return res.status(400).json({
                error: -1,
                message: `${typeLabel} đã hết hạn`,
            });
        }
        if (document.checkoutUrl) {
            return res.json({
                error: 0,
                message: "Link đã tồn tại",
                data: {
                    checkoutUrl: document.checkoutUrl,
                    code: code,
                    type: type,
                },
            });
        }
        const cancelUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/cart/checkout/payment`;
        const returnUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/order-success?code=${code}`;
        const paymentLink = yield payOS.paymentRequests.create({
            orderCode: Number(String(code).replace(/\D/g, "")),
            amount: Number(amount),
            description: description || code,
            items: items || [],
            cancelUrl,
            returnUrl,
        });
        document.checkoutUrl = paymentLink.checkoutUrl;
        yield document.save();
        console.log(`✅ Tạo payment link thành công cho ${type}: ${code}`);
        return res.json({
            error: 0,
            message: "Tạo link thanh toán thành công",
            data: {
                checkoutUrl: paymentLink.checkoutUrl,
                code: code,
                type: type,
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
        console.log("🔔 Webhook nhận:", { code, desc, orderCode: data.orderCode });
        if (code === "00" && desc === "success") {
            const orderCode = String(data.orderCode);
            const allOrders = yield Order.find({});
            const allRentals = yield Rental.find({});
            let paidCount = 0;
            for (const order of allOrders) {
                if (String(order.orderCode).includes(orderCode) ||
                    orderCode.includes(String(order.orderCode))) {
                    if (order.status === "pending") {
                        order.status = "paid";
                        yield order.save();
                        paidCount++;
                        yield new Transaction({
                            orderCode: String(order.orderCode),
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
                        try {
                            yield sendOrderConfirmationEmail(order.userInfo.email, order.orderCode);
                        }
                        catch (emailErr) {
                            console.error("⚠️ Lỗi gửi email:", emailErr);
                        }
                    }
                }
            }
            for (const rental of allRentals) {
                if (String(rental.rentalCode).includes(orderCode) ||
                    orderCode.includes(String(rental.rentalCode))) {
                    if (rental.status === "pending") {
                        rental.status = "renting";
                        rental.rentedAt = new Date();
                        yield rental.save();
                        paidCount++;
                        yield new Transaction({
                            orderCode: String(rental.rentalCode),
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
                        try {
                            yield sendOrderConfirmationEmail(rental.userInfo.email, rental.rentalCode);
                        }
                        catch (emailErr) {
                            console.error("⚠️ Lỗi gửi email:", emailErr);
                        }
                    }
                }
            }
            console.log(`✅ Đã cập nhật ${paidCount} đơn hàng`);
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
            console.log(`✅ Hủy payment link thành công: ${code}`);
        }
        catch (e) {
            console.log("⚠️ Không hủy được trên PayOS:", e.message);
        }
        console.log(`❌ Đơn ${type} ${code} đã bị hủy`);
        return res.json({
            error: 0,
            message: "Hủy thành công",
            type: type,
            code: code,
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
