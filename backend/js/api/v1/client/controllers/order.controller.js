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
const generateHelper = require("../../../../helpers/generate");
module.exports.index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const orders = yield Order.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = yield Order.countDocuments();
        return res.status(200).json({
            message: "Lấy danh sách đơn hàng thành công!",
            orders: orders,
            total: total,
            limit: limit,
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
            status: "pending",
        });
        yield order.save();
        return res.status(201).json({
            message: "Tạo đơn hàng thành công!",
            order: order,
            orderCode: orderCode,
        });
    }
    catch (error) {
        console.error("Lỗi tạo đơn hàng:", error);
        return res.status(500).json({
            message: "Lỗi tạo đơn hàng!",
            error: error.message,
        });
    }
});
module.exports.detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderCode } = req.params;
        const order = yield Order.findOne({ orderCode });
        if (!order) {
            return res.status(404).json({
                message: "Không tìm thấy đơn hàng!",
            });
        }
        return res.status(200).json({
            message: "Lấy thông tin đơn hàng thành công!",
            order: order,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Lỗi lấy thông tin đơn hàng!",
            error: error.message,
        });
    }
});
