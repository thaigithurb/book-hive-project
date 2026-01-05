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

    // check hết hạn
    if (user.refreshTokenExpiresAt < new Date()) {
      user.refreshToken = null;
      user.refreshTokenExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "refreshToken hết hạn" });
    }

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

export {};
