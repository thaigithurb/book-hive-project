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
const { generateDescriptionCode } = require("../../../../helpers/generate");
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
        const returnUrl = `${process.env.FRONTEND_URL}/order-success?codes=${encodeURIComponent(codes.join(","))}`;
        const descriptionCode = generateDescriptionCode();
        const paymentLink = yield payOS.paymentRequests.create({
            orderCode: Number(String(mainCode).replace(/\D/g, "")),
            amount: Number(amount),
            description: descriptionCode,
            items: items || [],
            cancelUrl,
            returnUrl,
        });
        for (const doc of documents) {
            doc.document.checkoutUrl = paymentLink.checkoutUrl;
            yield doc.document.save();
        }
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
module.exports.webhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, desc, data } = req.body;
        if (code === "00" && desc === "success") {
            const orderCode = String(data.orderCode);
            const allOrders = yield Order.find({});
            const allRentals = yield Rental.find({});
            let paidCount = 0;
            const paidDocuments = [];
            for (const order of allOrders) {
                if (String(order.orderCode).includes(orderCode) ||
                    orderCode.includes(String(order.orderCode))) {
                    if (order.status === "pending") {
                        order.status = "paid";
                        yield order.save();
                        paidCount++;
                        paidDocuments.push({ doc: order, type: "order" });
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
                        paidDocuments.push({ doc: rental, type: "rental" });
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
                    }
                }
            }
            try {
                if (paidDocuments.length === 1) {
                    const { doc, type } = paidDocuments[0];
                    const emailOrder = {
                        userInfo: doc.userInfo,
                        orderCode: type === "order" ? doc.orderCode : doc.rentalCode,
                        items: doc.items || [],
                        totalAmount: doc.totalAmount || 0,
                    };
                    yield sendOrderConfirmationEmail(emailOrder);
                }
                else if (paidDocuments.length > 1) {
                    const firstDoc = paidDocuments[0].doc;
                    const userInfo = firstDoc.userInfo;
                    const combinedCode = paidDocuments
                        .map((d) => d.type === "order" ? d.doc.orderCode : d.doc.rentalCode)
                        .join(", ");
                    const combinedItems = paidDocuments.flatMap((d) => d.doc.items || []);
                    const combinedTotal = paidDocuments.reduce((sum, d) => sum + (d.doc.totalAmount || 0), 0);
                    const combinedOrder = {
                        userInfo,
                        orderCode: combinedCode,
                        items: combinedItems,
                        totalAmount: combinedTotal,
                    };
                    yield sendOrderConfirmationEmail(combinedOrder);
                }
            }
            catch (emailErr) {
                console.error("Lỗi gửi email xác nhận đơn:", emailErr);
            }
        }
        return res.json({ message: "OK" });
    }
    catch (err) {
        console.error("Lỗi webhook:", err);
        return res.status(500).json({ message: "Lỗi xử lý webhook" });
    }
});
module.exports.cancelPaymentLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.params;
        console.log("Cancel request với code:", code);
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
            console.log("Không hủy được trên PayOS:", e.message);
        }
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
