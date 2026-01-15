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
const Order = require("../../models/order.model");
const Transaction = require("../../models/transaction.model");
const crypto = require("crypto");
const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;
module.exports.verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderCode } = req.body;
        if (!orderCode) {
            return res.status(400).json({
                message: "Thiếu mã đơn hàng!",
            });
        }
        const order = yield Order.findOne({ orderCode });
        if (!order) {
            return res.status(404).json({
                message: "Không tìm thấy đơn hàng!",
            });
        }
        if (order.status === "paid") {
            return res.status(200).json({
                message: "✅ Đơn hàng đã thanh toán!",
                order,
            });
        }
        if (order.status !== "pending") {
            return res.status(400).json({
                message: "Đơn hàng này không ở trạng thái chờ thanh toán!",
            });
        }
        console.log("🔄 Verify payment:", { orderCode });
        const transaction = yield Transaction.findOne({
            orderCode,
            status: "success",
        });
        if (transaction) {
            console.log("✅ Giao dịch đã xác nhận từ webhook PayOS");
            const updatedOrder = yield Order.findOneAndUpdate({ orderCode }, {
                status: "paid",
                paidAt: new Date(),
                updatedAt: new Date(),
            }, { new: true });
            return res.status(200).json({
                message: "✅ Xác nhận thanh toán thành công!",
                order: updatedOrder,
                transaction: {
                    id: transaction._id,
                    amount: transaction.amount,
                    description: transaction.description,
                },
            });
        }
        console.log("⏳ Chờ webhook từ PayOS");
        return res.status(400).json({
            message: "Chờ PayOS xác nhận giao dịch... Vui lòng thử lại trong vài giây.",
            tip: "Giao dịch có thể mất 10-30 giây để xác nhận",
        });
    }
    catch (error) {
        console.error("❌ Lỗi verify payment:", error);
        return res.status(500).json({
            message: "Lỗi xác nhận thanh toán!",
            error: error.message,
        });
    }
});
module.exports.webhookPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, signature } = req.body;
        console.log("🔔 Webhook từ PayOS:", JSON.stringify(data, null, 2));
        if (!data || !signature) {
            console.error("❌ Thiếu data hoặc signature");
            return res.status(400).json({ message: "Missing data or signature" });
        }
        const dataStr = JSON.stringify(data);
        const expectedSignature = crypto
            .createHmac("sha256", PAYOS_CHECKSUM_KEY)
            .update(dataStr)
            .digest("hex");
        console.log("🔐 Verify signature:", {
            received: signature,
            expected: expectedSignature,
            match: signature === expectedSignature,
        });
        if (signature !== expectedSignature) {
            console.error("❌ Signature không hợp lệ");
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id, orderCode, amount, amountPaid, description, transactionDateTime, referenceCode, status, } = data;
        console.log("📊 Dữ liệu webhook:", {
            orderCode,
            amount,
            amountPaid,
            status,
            description,
        });
        if (status !== "PAID" && status !== "00") {
            console.log("⚠️ Giao dịch chưa PAID:", status);
            return res.status(200).json({ message: "Payment not completed yet" });
        }
        const order = yield Order.findOne({ orderCode });
        if (!order) {
            console.error("❌ Không tìm thấy đơn hàng:", orderCode);
            return res.status(404).json({ message: "Order not found" });
        }
        const totalAmount = order.totalAmount;
        if (amountPaid !== totalAmount && amount !== totalAmount) {
            console.error("❌ Số tiền không khớp", {
                expected: totalAmount,
                paid: amountPaid,
                amount: amount,
            });
            return res.status(400).json({ message: "Amount mismatch" });
        }
        if (order.status === "paid") {
            console.log("⚠️ Đơn hàng đã thanh toán");
            return res.status(200).json({ message: "Already paid" });
        }
        let transaction = yield Transaction.findOne({ orderCode });
        if (transaction) {
            console.log("📝 Update transaction pending -> success");
            transaction.status = "success";
            transaction.amount = amountPaid || amount;
            transaction.description = description;
            transaction.transactionDate = new Date(transactionDateTime);
            transaction.referenceCode = referenceCode;
            transaction.verifiedAt = new Date();
            yield transaction.save();
        }
        else {
            console.log("📝 Tạo transaction mới từ webhook");
            transaction = new Transaction({
                orderCode,
                bankCode: process.env.PAYMENT_BANK_CODE || "970422",
                accountNo: process.env.PAYMENT_ACCOUNT_NUMBER,
                amount: amountPaid || amount,
                description,
                transactionDate: new Date(transactionDateTime),
                referenceCode,
                status: "success",
                verifiedAt: new Date(),
            });
            yield transaction.save();
        }
        const updatedOrder = yield Order.findOneAndUpdate({ orderCode }, {
            status: "paid",
            paidAt: new Date(),
            updatedAt: new Date(),
        }, { new: true });
        console.log("✅ Webhook xác nhận thanh toán thành công");
        return res.status(200).json({
            message: "Webhook processed successfully",
            code: "00",
            desc: "Success",
            data: {
                orderCode: updatedOrder.orderCode,
                status: updatedOrder.status,
            },
        });
    }
    catch (error) {
        console.error("❌ Lỗi xử lý webhook:", error);
        return res.status(200).json({
            message: "Webhook processing error",
            code: "01",
            desc: error.message,
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
        return res.status(200).json({
            message: "Lấy thông tin thanh toán thành công!",
            data: paymentInfo,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Lỗi lấy thông tin thanh toán!",
            error: error.message,
        });
    }
});
