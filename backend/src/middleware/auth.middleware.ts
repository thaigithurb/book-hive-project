const jwt = require("jsonwebtoken");
const Account = require("../api/v1/models/account.model");

module.exports.auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có accessToken" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const account = await Account.findOne({
      _id: decoded.id,
      status: "active",
      deleted: false,
    }).populate("role_id");

    if (!account) {
      return res
        .status(403)
        .json({ message: "Tài khoản không hợp lệ hoặc đã bị khóa" });
    }
    const permissions = account.role_id?.permissions || [];
    req.user = {
      ...decoded,
      role: account.role_id?.slug,
      permissions,
    };
    next();
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
