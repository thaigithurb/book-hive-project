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

  const paymentData = {
    orderCode: Number(orderCode),
    amount: Number(amount),
    description: description || "Thanh toán",
    items: items || [],
    cancelUrl: "http://localhost:3000/cart",
    returnUrl: "http://localhost:3000/order-success",
  };

  console.log("📞 Creating PayOS link with keys from .env");
  try {
    const paymentLink = await payOS.paymentRequests.create(paymentData);

    console.log("✅ Success:", paymentLink.checkoutUrl);

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
    console.error("❌ Error:", err.message);
    return res.status(500).json({
      error: -1,
      message: "Lỗi tạo link",
      details: err.message,
    });
  }
};

// [POST] /api/v1/payment/webhook
module.exports.webhook = async (req, res) => {
  try {
    const webhookData = await payOS.webhooks.verify(req.body);
    console.log("Thanh toán thành công:", webhookData);

    const orderCode = webhookData.orderCode || webhookData.data?.orderCode;
    if (orderCode) {
      const order = await Order.findOneAndUpdate(
        { orderCode: Number(orderCode) },
        { status: "paid" }
      );

      const transaction = new Transaction({
        orderCode: String(orderCode),
        bankCode:
          webhookData.counterAccountBankId ||
          webhookData.data?.counterAccountBankId ||
          "PAYOS",
        accountNo:
          webhookData.accountNumber || webhookData.data?.accountNumber || "",
        amount: webhookData.amount || webhookData.data?.amount || 0,
        description:
          webhookData.description || webhookData.data?.description || "Payment",
        transactionDate: webhookData.transactionDateTime
          ? new Date(webhookData.transactionDateTime)
          : new Date(),
        status: "success",
        verifiedAt: new Date(),
      });

      await transaction.save();

      if (order) {
        await sendOrderConfirmationEmail(order);
      }
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook không hợp lệ:", error);
    res.status(400).send("Invalid webhook");
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

    await Order.findOneAndUpdate(
      { orderCode: Number(orderCode) },
      { status: "cancelled" }
    );

    res.json({
      error: 0,
      message: "Hủy link thanh toán thành công",
    });
  } catch (err) {
    res.status(500).json({
      error: -1,
      message: "Lỗi hủy link thanh toán",
    });
  }
};

export {};

export {};
