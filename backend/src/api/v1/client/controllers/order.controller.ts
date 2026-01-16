const Order = require("../../models/order.model");
const generateHelper = require("../../../../helpers/generate");

// [GET] /api/v1/orders
module.exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments();

    return res.status(200).json({
      message: "Lấy danh sách đơn hàng thành công!",
      orders: orders,
      total: total,
      limit: limit,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi lấy danh sách đơn hàng!",
      error: error.message,
    });
  }
};

// [POST] /api/v1/orders/create
module.exports.create = async (req, res) => {
  try {
    const { userInfo, items, totalAmount, paymentMethod } = req.body;

    if (!userInfo || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({
        message: "Thông tin đơn hàng không đầy đủ!",
      });
    }

    // Tạo mã đơn hàng
    const orderCode = generateHelper.generateOrderCode();

    const order = new Order({
      orderCode,
      userInfo,
      items,
      totalAmount,
      paymentMethod,
      status: "pending",
    });

    await order.save();

    return res.status(201).json({
      message: "Tạo đơn hàng thành công!",
      order: order,
      orderCode: orderCode,
    });
  } catch (error) {
    console.error("Lỗi tạo đơn hàng:", error);
    return res.status(500).json({
      message: "Lỗi tạo đơn hàng!",
      error: error.message,
    });
  }
};

// [GET] /api/v1/orders/detail/:orderCode
module.exports.detail = async (req, res) => {
  try {
    const { orderCode } = req.params;

    const order = await Order.findOne({ orderCode });

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng!",
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin đơn hàng thành công!",
      order: order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi lấy thông tin đơn hàng!",
      error: error.message,
    });
  }
};


export {};
