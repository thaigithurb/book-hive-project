import slugify from "slugify";

const generate = require("../../../../helpers/generate");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/user.model");

// /api/v1/register
exports.register = async (req, res) => {
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được đăng ký",
      });
    }

    const slug = slugify(fullName, { lower: true, strict: true, locale: "vi" });

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      slug,
      loginMethod: "password",
      status: "active",
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
    });
  }
};

// /api/v1/loginWithPassword
exports.loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
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

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc password sai",
      });
    }

    // Tạo mới refreshToken
    const refreshToken = generate.generateRefreshToken();

    // Lưu refreshToken mới vào DB
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    res.cookie("refreshToken_user", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: user.refreshTokenExpiresAt,
    });

    // tạo mới accessToken
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    await user.save();

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// [POST] /api/v1/auth/refresh
module.exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken_user;
    if (!refreshToken) {
      return res.status(401).json({ message: "Không có refreshToken" });
    }

    const user = await User.findOne({ refreshToken });
    if (
      !user ||
      !user.refreshTokenExpiresAt ||
      user.refreshTokenExpiresAt < new Date()
    ) {
      return res.status(401).json({ message: "Phiên đăng nhập hết hạn!" });
    }

    // Tạo accessToken mới
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: "Làm mới accessToken thành công!",
      accessToken,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Làm mới accessToken thất bại",
    });
  }
};

// [POST] /api/v1/auth/verify
module.exports.verify = async (req, res) => {
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
  } catch (error) {
    return res.status(400).json({
      message: "Xác thực không thành công",
    });
  }
};

// [POST] /api/v1/auth/logout
module.exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken_user;

    await User.findOneAndUpdate(
      {
        refreshToken: refreshToken,
      },
      { refreshToken: null, refreshTokenExpiresAt: null }
    );

    res.clearCookie("refreshToken_user", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Đăng xuất thành công!" });
  } catch (error) {
    return res.status(400).json({
      message: "Đăng xuất thất bại",
    });
  }
};

// [POST] /api/v1/auth/logout
module.exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken_admin;

    await User.findOneAndUpdate(
      {
        refreshToken: refreshToken,
      },
      { refreshToken: null, refreshTokenExpiresAt: null }
    );

    res.clearCookie("refreshToken_user", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Đăng xuất thành công!" });
  } catch (error) {
    return res.status(400).json({
      message: "Đăng xuất thất bại",
    });
  }
};

export {};
