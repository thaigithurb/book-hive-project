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
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Account = require("../../models/account.model");
const generate = require("../../../../helpers/generate");
module.exports.login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield Account.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email không tồn tại" });
        }
        const isMatch = yield bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu không đúng" });
        }
        if (user.deleted === true) {
            return res.status(400).json({ message: "Tài khoản đã bị xóa" });
        }
        if (user.status === "inactive") {
            return res.status(400).json({ message: "Tài khoản đang bị khóa" });
        }
        const refreshToken = generate.generateRefreshToken();
        user.refreshToken = refreshToken;
        user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        yield user.save();
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            expires: user.refreshTokenExpiresAt,
        });
        const accessToken = jwt.sign({ id: user._id, email: user.email, role_id: user.role_id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        return res.status(200).json({
            message: "Đăng nhập thành công!",
            accessToken,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Đăng nhập thất bại",
        });
    }
});
module.exports.refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Không có refreshToken" });
        }
        const user = yield Account.findOne({ refreshToken });
        if (!user ||
            !user.refreshTokenExpiresAt ||
            user.refreshTokenExpiresAt < new Date()) {
            return res
                .status(401)
                .json({ message: "Phiên đăng nhập hết hạn!" });
        }
        const accessToken = jwt.sign({ id: user._id, email: user.email, role_id: user.role_id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        return res.status(200).json({
            message: "Làm mới accessToken thành công!",
            accessToken,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Làm mới accessToken thất bại",
        });
    }
});
module.exports.verify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Không có accessToken" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(400).json({ message: "Token không hợp lệ!" });
        }
        req.user = decoded;
        return res.status(200).json({ message: "Token hợp lệ!" });
    }
    catch (error) {
        return res.status(400).json({
            message: "Xác thực không thành công",
        });
    }
});
module.exports.logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.refreshToken;
        yield Account.findOneAndUpdate({
            refreshToken: refreshToken,
        }, { refreshToken: null, refreshTokenExpiresAt: null });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        return res.status(200).json({ message: "Đăng xuất thành công!" });
    }
    catch (error) {
        return res.status(400).json({
            message: "Đăng xuất thất bại",
        });
    }
});
