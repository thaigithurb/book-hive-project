const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Account = require("../../models/account.model");
const generate = require("../../../../helpers/generate");

// [POST] /api/v1/admin/auth/login
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Account.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    if (user.deleted === true) {
      return res.status(400).json({ message: "Tài khoản đã bị xóa" });
    }

    if (user.status === "inactive") {
      return res.status(400).json({ message: "Tài khoản đang bị khóa" });
    }

    // Tạo mới refreshToken
    const refreshToken = generate.generateRefreshToken();

    // Lưu refreshToken mới vào DB
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 ngày
    );
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: user.refreshTokenExpiresAt,
    });

    // tạo mới accessToken
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: "Đăng nhập thành công!",
      accessToken,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Đăng nhập thất bại",
    });
  }
};

// [POST] /api/v1/admin/auth/refresh
module.exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Không có refreshToken" });
    }

    const user = await Account.findOne({ refreshToken });
    if (
      !user ||
      !user.refreshTokenExpiresAt ||
      user.refreshTokenExpiresAt < new Date()
    ) {
      return res
        .status(401)
        .json({ message: "RefreshToken không hợp lệ hoặc đã hết hạn" });
    }

    // Tạo accessToken mới
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role_id: user.role_id },
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

// [POST] /api/v1/admin/auth/verify
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

// [POST] /api/v1/admin/auth/logout
module.exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    await Account.findOneAndUpdate(
      {
        refreshToken: refreshToken,
      },
      { refreshToken: null, refreshTokenExpiresAt: null }
    );

    res.clearCookie("refreshToken", {
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
