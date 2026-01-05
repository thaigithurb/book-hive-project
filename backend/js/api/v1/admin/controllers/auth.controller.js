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
        if (user.refreshTokenExpiresAt < new Date()) {
            user.refreshToken = null;
            user.refreshTokenExpiresAt = null;
            yield user.save();
            return res.status(400).json({ message: "refreshToken hết hạn" });
        }
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
