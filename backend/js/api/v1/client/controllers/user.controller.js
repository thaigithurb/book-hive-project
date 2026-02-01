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
const User = require("../../models/user.model");
module.exports.index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const users = yield User.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = yield User.countDocuments();
        return res.status(200).json({
            message: "Lấy danh sách người dùng thành công!",
            users,
            total,
            limit,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Lỗi lấy danh sách người dùng!",
            error: error.message,
        });
    }
});
module.exports.getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const user = yield User.findOne({ _id: userId }).select("fullName phone email");
        if (!user) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng!",
            });
        }
        return res.status(200).json({
            message: "Lấy thông tin người dùng thành công!",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Lỗi lấy thông tin người dùng!",
            error: error.message,
        });
    }
});
module.exports.edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const user = yield User.findOne({ _id: userId }).select("fullName phone ");
        if (!user) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng!",
            });
        }
        const { fullName, phone } = req.body;
        if (fullName !== undefined)
            user.fullName = fullName;
        if (phone !== undefined)
            user.phone = phone || "";
        yield user.save();
        return res.status(200).json({
            message: "Cập nhật thông tin thành công!",
            user: {
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Lỗi cập nhật thông tin người dùng!",
            error: error.message,
        });
    }
});
