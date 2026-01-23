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
const Rental = require("../../models/rental.model");
const generateHelper = require("../../../../helpers/generate");
module.exports.index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit);
        const skip = (page - 1) * limit;
        const orders = yield Order.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = yield Order.countDocuments();
        return res.status(200).json({
            message: "Lấy danh sách đơn hàng thành công!",
            orders,
            total,
            limit,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Lỗi lấy danh sách đơn hàng!",
            error: error.message,
        });
    }
});
module.exports.create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userInfo, items, totalAmount, paymentMethod } = req.body;
        if (!userInfo || !items || items.length === 0 || !totalAmount) {
            return res.status(400).json({
                message: "Thông tin đơn hàng không đầy đủ!",
            });
        }
        const orderCode = generateHelper.generateOrderCode();
        const order = new Order({
            orderCode,
            userInfo,
            items,
            totalAmount,
            paymentMethod,
        });
        yield order.save();
        return res.status(201).json({
            message: "Tạo đơn hàng thành công!",
            order,
            orderCode,
        });
    }
    catch (error) {
        console.error("❌ Lỗi tạo đơn:", error);
        return res.status(500).json({
            message: "Lỗi tạo đơn hàng!",
            error: error.message,
        });
    }
});
module.exports.detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderCode } = req.params;
        const code = orderCode;
        let document = yield Order.findOne({ orderCode: String(code) });
        if (!document) {
            document = yield Rental.findOne({ rentalCode: String(code) });
        }
        if (!document) {
            return res.status(404).json({
                message: "Không tìm thấy đơn hàng!",
                debug: { code, searchedFor: String(code) }
            });
        }
        return res.status(200).json({
            message: "Lấy thông tin đơn hàng thành công!",
            order: document,
        });
    }
    catch (error) {
        console.error("❌ Detail error:", error);
        return res.status(500).json({
            message: "Lỗi lấy thông tin đơn hàng!",
            error: error.message,
        });
    }
});
module.exports.getOrdersByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const orders = yield Order.find({ "userInfo.email": email })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = yield Order.countDocuments({ "userInfo.email": email });
        return res.status(200).json({
            orders,
            total,
            page,
            limit,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Lỗi lấy danh sách đơn hàng!",
            error: error.message,
        });
    }
});
module.exports.createRental = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userInfo, items, totalAmount, paymentMethod } = req.body;
        if (!userInfo || !items || items.length === 0 || !totalAmount) {
            return res.status(400).json({
                message: "Thông tin đơn thuê không đầy đủ!",
            });
        }
        const rentalCode = generateHelper.generateOrderCode();
        const dueAt = new Date();
        items.forEach((item) => {
            if (item.rentalType === "day") {
                dueAt.setDate(dueAt.getDate() + item.rentalDays);
            }
            else if (item.rentalType === "week") {
                dueAt.setDate(dueAt.getDate() + item.rentalDays * 7);
            }
        });
        const rental = new Rental({
            rentalCode,
            userInfo,
            items,
            totalAmount,
            paymentMethod,
            dueAt,
        });
        yield rental.save();
        return res.status(201).json({
            message: "Tạo đơn thuê thành công!",
            rental,
            rentalCode,
        });
    }
    catch (error) {
        console.error("❌ Lỗi tạo đơn thuê:", error);
        return res.status(500).json({
            message: "Lỗi tạo đơn thuê!",
            error: error.message,
        });
    }
});
