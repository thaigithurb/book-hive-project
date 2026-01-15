const payos = require("../../../../config/payos");
const Order = require("../../models/order.model");
const Transaction = require("../../models/transaction.model");

// 1. Hàm tạo link thanh toán
module.exports.createPaymentLink = async (req, res) => {
  try {
    const { orderCode, amount, description, items, returnUrl, cancelUrl } =
      req.body;

    if (!orderCode || !amount || !description) {
      return res.status(400).json({
        error: -1,
        message: "Thiếu thông tin bắt buộc!",
      });
    }

    const APP_URL = process.env.APP_URL || "http://localhost:3000";

    const body = {
      orderCode: Number(orderCode),
      amount: Number(amount),
      description: description,
      items: items || [
        {
          name: description,
          quantity: 1,
          price: Number(amount),
        },
      ],
      cancelUrl: cancelUrl || `${APP_URL}/cart`,
      returnUrl: returnUrl || `${APP_URL}/order-success`,
    };

    console.log("🔗 Creating payment link:", body);

    const paymentLinkResponse = await payos.createPaymentLink(body);

    console.log("✅ Payment link created:", paymentLinkResponse.checkoutUrl);

    // Lưu order vào database
    const order = await Order.create({
      orderCode: Number(orderCode),
      amount: Number(amount),
      description: description,
      items: items || [],
      status: "pending",
      paymentLinkId: paymentLinkResponse.id,
    });

    console.log("💾 Order saved:", order._id);

    return res.status(200).json({
      error: 0,
      message: "Tạo link thanh toán thành công",
      data: {
        orderCode: paymentLinkResponse.orderCode,
        checkoutUrl: paymentLinkResponse.checkoutUrl,
        paymentLinkId: paymentLinkResponse.id,
        amount: paymentLinkResponse.amount,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi tạo link thanh toán:", error);
    return res.status(500).json({
      error: -1,
      message: "Lỗi tạo link thanh toán!",
    });
  }
};

// 2. Hàm nhận Webhook từ PayOS
module.exports.receiveWebhook = async (req, res) => {
  try {
    const webhookBody = req.body;
    console.log("🔔 Webhook received:", JSON.stringify(webhookBody, null, 2));

    // ✅ Verify webhook signature
    let webhookData;
    try {
      webhookData = payos.verifyPaymentWebhookData(webhookBody);
      console.log("✅ Webhook signature verified!");
      console.log("📊 Verified data:", webhookData);
    } catch (verifyError) {
      console.error("❌ Signature verification failed:", verifyError.message);
      return res.status(200).json({
        error: -1,
        message: "Signature verification failed",
      });
    }

    // Kiểm tra code giao dịch
    if (webhookData.desc !== "success" && webhookData.code !== "00") {
      console.log("⚠️ Giao dịch thất bại:", webhookData.desc);
      return res.status(200).json({
        error: 0,
        message: "Webhook xác nhận thành công",
        data: {
          orderCode: webhookData.orderCode,
          status: "failed",
          desc: webhookData.desc,
        },
      });
    }

    console.log("💰 Processing successful transaction:", {
      orderCode: webhookData.orderCode,
      amount: webhookData.amount,
    });

    // Kiểm tra transaction đã tồn tại chưa (tránh duplicate)
    const existingTransaction = await Transaction.findOne({
      orderCode: webhookData.orderCode,
    });

    if (existingTransaction) {
      console.log("⚠️ Transaction already exists");
      return res.status(200).json({
        error: 0,
        message: "Webhook xác nhận thành công",
        data: {
          orderCode: webhookData.orderCode,
          status: "duplicated",
        },
      });
    }

    // ✅ Lưu transaction vào DB
    const transaction = await Transaction.create({
      orderCode: webhookData.orderCode,
      amount: webhookData.amount,
      description: webhookData.description,
      reference: webhookData.reference,
      transactionDateTime: webhookData.transactionDateTime,
      paymentLinkId: webhookData.paymentLinkId,
      accountNumber: webhookData.accountNumber,
      status: "success",
      metadata: webhookData,
    });

    console.log("💾 Transaction saved:", transaction._id);

    // ✅ Update order status to "paid"
    const updatedOrder = await Order.findOneAndUpdate(
      { orderCode: webhookData.orderCode },
      {
        status: "paid",
        paidAt: new Date(),
      },
      { new: true }
    );

    if (updatedOrder) {
      console.log("✅ Order updated to paid:", updatedOrder._id);
    }

    return res.status(200).json({
      error: 0,
      message: "Webhook xác nhận thành công",
      data: {
        orderCode: webhookData.orderCode,
        status: "success",
      },
    });
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    return res.status(200).json({
      error: -1,
      message: "Lỗi xử lý webhook",
    });
  }
};

module.exports.verifyPayment = async (req, res) => {
  try {
    const { orderCode } = req.body;

    if (!orderCode) {
      return res.status(400).json({
        error: -1,
        message: "Thiếu mã đơn hàng!",
      });
    }

    console.log("🔍 Verifying payment for orderCode:", orderCode);

    // ✅ Tìm transaction thành công (được lưu bởi webhook)
    const transaction = await Transaction.findOne({
      orderCode: Number(orderCode),
      status: "success",
    });

    if (transaction) {
      console.log("✅ Transaction found:", transaction._id);

      return res.status(200).json({
        error: 0,
        message: "Thanh toán thành công",
        data: {
          orderCode,
          amount: transaction.amount,
          reference: transaction.reference,
          transactionDateTime: transaction.transactionDateTime,
        },
      });
    }

    // ❌ Chưa có transaction - webhook chưa tới
    console.log("⏳ Webhook not received yet:", orderCode);

    return res.status(200).json({
      error: -1,
      message: "Không tìm thấy giao dịch...",
      orderCode,
    });
  } catch (error) {
    console.error("❌ Lỗi verify payment:", error);
    return res.status(500).json({
      error: -1,
      message: "Lỗi xác nhận thanh toán!",
    });
  }
};

module.exports.getPaymentInfo = async (req, res) => {
  try {
    const paymentInfo = {
      bankName: process.env.PAYMENT_BANK_NAME || "MB Bank",
      accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER,
      accountHolder: process.env.PAYMENT_ACCOUNT_HOLDER,
    };

    console.log("📋 Payment info requested");

    return res.status(200).json({
      error: 0,
      message: "Lấy thông tin thanh toán thành công",
      data: paymentInfo,
    });
  } catch (error) {
    console.error("❌ Lỗi lấy thông tin thanh toán:", error);
    return res.status(500).json({
      error: -1,
      message: "Lỗi lấy thông tin thanh toán!",
    });
  }
};


export {};
