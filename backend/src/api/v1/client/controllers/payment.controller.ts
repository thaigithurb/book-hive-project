const { PayOS } = require("@payos/node");

const payOS = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

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

export {};
