const User = require("../../models/user.model");

// [GET] /api/v1/orders
module.exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    return res.status(200).json({
      message: "Lấy danh sách người dùng thành công!",
      users,
      total,
      limit,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi lấy danh sách người dùng!",
      error: error.message,
    });
  }
};


export {};
