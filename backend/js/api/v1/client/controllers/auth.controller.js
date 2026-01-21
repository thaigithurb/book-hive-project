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
const slugify_1 = require("slugify");
const { OAuth2Client } = require("google-auth-library");
const generate = require("../../../../helpers/generate");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, email, password, confirmPassword } = req.body;
        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin",
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu không khớp",
            });
        }
        const hashedPassword = yield bcrypt.hash(password, 10);
        const existingUser = yield User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email đã được đăng ký",
            });
        }
        const slug = (0, slugify_1.default)(fullName, { lower: true, strict: true, locale: "vi" });
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            slug,
            loginMethod: "password",
            status: "active",
        });
        yield newUser.save();
        res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
            user: {
                id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Lỗi server",
        });
    }
});
exports.loginWithPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User.findOne({
            email,
            deleted: false,
            status: "active",
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc password sai",
            });
        }
        const isPasswordValid = yield bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc password sai",
            });
        }
        const refreshToken = generate.generateRefreshToken();
        user.refreshToken = refreshToken;
        user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        res.cookie("refreshToken_user", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            expires: user.refreshTokenExpiresAt,
        });
        const accessToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        yield user.save();
        res.json({
            success: true,
            message: "Đăng nhập thành công",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                avatar: user.avatar,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message,
        });
    }
});
module.exports.refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.refreshToken_user;
        if (!refreshToken) {
            return res.status(401).json({ message: "Không có refreshToken" });
        }
        const user = yield User.findOne({ refreshToken });
        if (!user ||
            !user.refreshTokenExpiresAt ||
            user.refreshTokenExpiresAt < new Date()) {
            return res.status(401).json({ message: "Phiên đăng nhập hết hạn!" });
        }
        const accessToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
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
        const refreshToken = req.cookies.refreshToken_user;
        yield User.findOneAndUpdate({
            refreshToken: refreshToken,
        }, { refreshToken: null, refreshTokenExpiresAt: null });
        res.clearCookie("refreshToken_user", {
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
module.exports.logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.refreshToken_admin;
        yield User.findOneAndUpdate({
            refreshToken: refreshToken,
        }, { refreshToken: null, refreshTokenExpiresAt: null });
        res.clearCookie("refreshToken_user", {
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
module.exports.loginWithGoogle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token Google không được cung cấp",
            });
        }
        const ticket = yield client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const googleId = payload.sub;
        const googleEmail = payload.email;
        const fullName = payload.name;
        let user = yield User.findOne({ googleId, deleted: false });
        if (!user) {
            user = yield User.findOne({ email: googleEmail, deleted: false });
            if (!user) {
                const slug = (0, slugify_1.default)(fullName, {
                    lower: true,
                    strict: true,
                    locale: "vi",
                });
                user = new User({
                    fullName,
                    email: googleEmail,
                    googleId,
                    googleEmail,
                    slug,
                    loginMethod: "google",
                    status: "active",
                    isEmailVerified: true,
                });
                yield user.save();
            }
            else {
                user.googleId = googleId;
                user.googleEmail = googleEmail;
                user.loginMethod = "google";
                user.isEmailVerified = true;
                yield user.save();
            }
        }
        const refreshToken = generate.generateRefreshToken();
        user.refreshToken = refreshToken;
        user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const accessToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.cookie("refreshToken_user", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            expires: user.refreshTokenExpiresAt,
        });
        yield user.save();
        return res.status(200).json({
            success: true,
            message: "Đăng nhập với Google thành công!",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                loginMethod: user.loginMethod,
            },
        });
    }
    catch (error) {
        console.error("Google auth error:", error);
        return res.status(400).json({
            success: false,
            message: "Đăng nhập Google thất bại",
            error: error.message,
        });
    }
});
