const Order = require("../../models/order.model");
const Rental = require("../../models/rental.model");
const generateHelper = require("../../../../helpers/generate");

// [GET] /api/v1/orders
module.exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments();

    return res.status(200).json({
      message: "Lấy danh sách đơn hàng thành công!",
      orders,
      total,
      limit,
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

    const orderCode = generateHelper.generateOrderCode();

    const order = new Order({
      orderCode,
      userInfo,
      items,
      totalAmount,
      paymentMethod,
    });

    await order.save();

    return res.status(201).json({
      message: "Tạo đơn hàng thành công!",
      order,
      orderCode,
    });
  } catch (error) {
    console.error("❌ Lỗi tạo đơn:", error);
    return res.status(500).json({
      message: "Lỗi tạo đơn hàng!",
      error: error.message,
    });
  }
};

// [GET] /api/v1/orders/detail/:code
module.exports.detail = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const code = orderCode; 

    let document = await Order.findOne({ orderCode: String(code) });
    
    if (!document) {
      document = await Rental.findOne({ rentalCode: String(code) });
    }

    if (!document) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng!",
        debug: { code, searchedFor: String(code) }
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin đơn hàng thành công!",
      order: document,
    });
  } catch (error) {
    console.error("❌ Detail error:", error);
    return res.status(500).json({
      message: "Lỗi lấy thông tin đơn hàng!",
      error: error.message,
    });
  }
};

// [GET] /api/v1/orders/user/:email
module.exports.getOrdersByUser = async (req, res) => {
  try {
    const { email } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ "userInfo.email": email })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments({ "userInfo.email": email });

    return res.status(200).json({
      orders,
      total,
      page,
      limit,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi lấy danh sách đơn hàng!",
      error: error.message,
    });
  }
};

// [POST] /api/v1/orders/rentals/create
module.exports.createRental = async (req, res) => {
  try {
    const { userInfo, items, totalAmount, paymentMethod } = req.body;

    if (!userInfo || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({
        message: "Thông tin đơn thuê không đầy đủ!",
      });
    }

    const rentalCode = generateHelper.generateOrderCode();
    const dueAt = new Date();
    items.forEach((item) => {
      if (item.rentalType === "day") {
        dueAt.setDate(dueAt.getDate() + item.rentalDays);
      } else if (item.rentalType === "week") {
        dueAt.setDate(dueAt.getDate() + item.rentalDays * 7);
      }
    });
    const rental = new Rental({
      rentalCode,
      userInfo,
      items,
      totalAmount,
      paymentMethod,
      dueAt,
    });

    await rental.save();

    return res.status(201).json({
      message: "Tạo đơn thuê thành công!",
      rental,
      rentalCode,
    });
  } catch (error) {
    console.error("❌ Lỗi tạo đơn thuê:", error);
    return res.status(500).json({
      message: "Lỗi tạo đơn thuê!",
      error: error.message,
    });
  }
};

export {};
