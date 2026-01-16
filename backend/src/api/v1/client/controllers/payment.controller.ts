const { PayOS } = require("@payos/node");
const Order = require("../../models/order.model");
const Transaction = require("../../models/transaction.model");
const { sendOrderConfirmationEmail } = require("../../../../helpers/sendEmail");

const payOS = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

// [POST] /api/v1/payment/create
module.exports.createPaymentLink = async (req, res) => {
  const { orderCode, amount, description, items } = req.body;

  try {
    const existingOrder = await Order.findOne({ orderCode: Number(orderCode) });

    if (!existingOrder) {
      return res.status(404).json({
        error: -1,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // ✅ Kiểm tra hết hạn
    const now = new Date();
    if (existingOrder.expiredAt && now > existingOrder.expiredAt) {
      existingOrder.isExpired = true;
      existingOrder.status = "cancelled";
      await existingOrder.save();

      return res.status(400).json({
        error: -1,
        message: "Đơn hàng đã hết hạn",
      });
    }

    // ✅ Nếu đã có link, trả về luôn
    if (existingOrder.checkoutUrl) {
      return res.json({
        error: 0,
        message: "Link thanh toán đã tồn tại",
        data: {
          checkoutUrl: existingOrder.checkoutUrl,
          orderCode: existingOrder.orderCode,
        },
      });
    }

    // ✅ Tạo link mới
    const paymentData = {
      orderCode: Number(orderCode),
      amount: Number(amount),
      description: description,
      items: items || [],
      cancelUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/cart`,
      returnUrl: `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/order-success`,
    };

    const paymentLink = await payOS.paymentRequests.create(paymentData);

    // ✅ Lưu checkout URL vào database
    existingOrder.checkoutUrl = paymentLink.checkoutUrl;
    await existingOrder.save();

    return res.json({
      error: 0,
      message: "Tạo link thành công",
      data: {
        checkoutUrl: paymentLink.checkoutUrl,
        orderCode: paymentLink.orderCode,
        paymentLinkId: paymentLink.paymentLinkId,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi tạo payment link:", err);
    return res.status(500).json({
      error: -1,
      message: "Lỗi tạo link thanh toán",
      details: err.message,
    });
  }
};

// [POST] /api/v1/payment/webhook
module.exports.webhook = async (req, res) => {
  try {
    const webhookData = req.body;

    if (webhookData.code === "00" && webhookData.desc === "success") {
      const orderCode = webhookData.data.orderCode;

      const order = await Order.findOne({ orderCode: orderCode });

      if (order && order.status === "pending") {
        order.status = "paid";
        await order.save();

        const transaction = new Transaction({
          orderCode: String(orderCode),
          bankCode: webhookData.data.counterAccountBankId || "PAYOS",
          accountNo: webhookData.data.accountNumber || "",
          amount: webhookData.data.amount || 0,
          description: webhookData.data.description || "Thanh toán",
          transactionDate: webhookData.data.transactionDateTime
            ? new Date(webhookData.data.transactionDateTime)
            : new Date(),
          status: "success",
          verifiedAt: new Date(),
        });

        await transaction.save();

        await sendOrderConfirmationEmail(
          order.userInfo.email,
          order.userInfo.fullName,
          order.orderCode,
          order.items,
          order.totalAmount
        );

        console.log("✅ Cập nhật trạng thái thành công:", orderCode);
      }
    }

    return res.json({ message: "Webhook xử lý thành công" });
  } catch (err) {
    console.error("❌ Lỗi xử lý webhook:", err);
    return res.status(500).json({ message: "Lỗi xử lý webhook" });
  }
};

// [POST] /api/v1/payment/cancel/:orderCode
module.exports.cancelPaymentLink = async (req, res) => {
  try {
    const { orderCode } = req.params;

    const order = await Order.findOne({ orderCode: Number(orderCode) });

    if (!order) {
      return res.status(404).json({
        error: -1,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (order.status === "paid") {
      return res.status(400).json({
        error: -1,
        message: "Đơn hàng đã thanh toán, không thể hủy",
      });
    }

    order.status = "cancelled";
    order.isExpired = true;
    await order.save();

    try {
      await payOS.paymentRequests.cancel(Number(orderCode));
    } catch (cancelErr) {
      console.log("⚠️ Không hủy được trên PayOS:", cancelErr.message);
    }

    return res.json({
      error: 0,
      message: "Hủy đơn hàng thành công",
    });
  } catch (err) {
    console.error("❌ Lỗi hủy đơn:", err);
    return res.status(500).json({
      error: -1,
      message: "Lỗi hủy đơn hàng",
    });
  }
};

export {};
