const Rental = require("../../models/rental.model");
const generateHelper = require("../../../../helpers/generate");

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

// [GET] /api/v1/rentals/detail/:code
module.exports.detail = async (req, res) => {
  try {
    const { code } = req.params;

    const rental = await Rental.findOne({ rentalCode: String(code) });

    if (!rental) {
      return res.status(404).json({
        message: "Không tìm thấy đơn thuê!",
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin đơn thuê thành công!",
      order: rental,
    });
  } catch (error) {
    console.error("❌ Detail error:", error);
    return res.status(500).json({
      message: "Lỗi lấy thông tin đơn thuê!",
      error: error.message,
    });
  }
};