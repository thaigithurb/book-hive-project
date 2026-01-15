const Order = require("../../models/order.model");
const Transaction = require("../../models/transaction.model");
const crypto = require("crypto");

const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

// [POST] /api/v1/payments/verify
module.exports.verifyPayment = async (req, res) => {
  try {
    const { orderCode } = req.body;

    if (!orderCode) {
      return res.status(400).json({
        message: "Thiếu mã đơn hàng!",
      });
    }

    const order = await Order.findOne({ orderCode });

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng!",
      });
    }

    if (order.status === "paid") {
      return res.status(200).json({
        message: "✅ Đơn hàng đã thanh toán!",
        order,
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Đơn hàng này không ở trạng thái chờ thanh toán!",
      });
    }

    console.log("🔄 Verify payment:", { orderCode });

    // Kiểm tra transaction đã được webhook xác nhận chưa
    const transaction = await Transaction.findOne({
      orderCode,
      status: "success",
    });

    if (transaction) {
      console.log("✅ Giao dịch đã xác nhận từ webhook PayOS");

      const updatedOrder = await Order.findOneAndUpdate(
        { orderCode },
        {
          status: "paid",
          paidAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true }
      );

      return res.status(200).json({
        message: "✅ Xác nhận thanh toán thành công!",
        order: updatedOrder,
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          description: transaction.description,
        },
      });
    }

    // Chưa có webhook, chờ...
    console.log("⏳ Chờ webhook từ PayOS");
    return res.status(400).json({
      message:
        "Chờ PayOS xác nhận giao dịch... Vui lòng thử lại trong vài giây.",
      tip: "Giao dịch có thể mất 10-30 giây để xác nhận",
    });
  } catch (error: any) {
    console.error("❌ Lỗi verify payment:", error);
    return res.status(500).json({
      message: "Lỗi xác nhận thanh toán!",
      error: error.message,
    });
  }
};

// [POST] /api/v1/payments/webhook
module.exports.webhookPayment = async (req, res) => {
  try {
    const { data, signature } = req.body;

    console.log("🔔 Webhook từ PayOS:", JSON.stringify(data, null, 2));

    if (!data || !signature) {
      console.error("❌ Thiếu data hoặc signature");
      return res.status(400).json({ message: "Missing data or signature" });
    }

    // ✅ Verify signature
    const dataStr = JSON.stringify(data);
    const expectedSignature = crypto
      .createHmac("sha256", PAYOS_CHECKSUM_KEY)
      .update(dataStr)
      .digest("hex");

    console.log("🔐 Verify signature:", {
      received: signature,
      expected: expectedSignature,
      match: signature === expectedSignature,
    });

    if (signature !== expectedSignature) {
      console.error("❌ Signature không hợp lệ");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Parse dữ liệu
    const {
      id,
      orderCode,
      amount,
      amountPaid,
      description,
      transactionDateTime,
      referenceCode,
      status,
    } = data;

    console.log("📊 Dữ liệu webhook:", {
      orderCode,
      amount,
      amountPaid,
      status,
      description,
    });

    // Kiểm tra status (PayOS dùng status code)
    // "PAID" hoặc "00" = thành công
    if (status !== "PAID" && status !== "00") {
      console.log("⚠️ Giao dịch chưa PAID:", status);
      return res.status(200).json({ message: "Payment not completed yet" });
    }

    const order = await Order.findOne({ orderCode });

    if (!order) {
      console.error("❌ Không tìm thấy đơn hàng:", orderCode);
      return res.status(404).json({ message: "Order not found" });
    }

    // Kiểm tra số tiền
    const totalAmount = order.totalAmount;
    if (amountPaid !== totalAmount && amount !== totalAmount) {
      console.error("❌ Số tiền không khớp", {
        expected: totalAmount,
        paid: amountPaid,
        amount: amount,
      });
      return res.status(400).json({ message: "Amount mismatch" });
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status === "paid") {
      console.log("⚠️ Đơn hàng đã thanh toán");
      return res.status(200).json({ message: "Already paid" });
    }

    // Cập nhật/Tạo transaction
    let transaction = await Transaction.findOne({ orderCode });

    if (transaction) {
      console.log("📝 Update transaction pending -> success");
      transaction.status = "success";
      transaction.amount = amountPaid || amount;
      transaction.description = description;
      transaction.transactionDate = new Date(transactionDateTime);
      transaction.referenceCode = referenceCode;
      transaction.verifiedAt = new Date();
      await transaction.save();
    } else {
      console.log("📝 Tạo transaction mới từ webhook");
      transaction = new Transaction({
        orderCode,
        bankCode: process.env.PAYMENT_BANK_CODE || "970422",
        accountNo: process.env.PAYMENT_ACCOUNT_NUMBER,
        amount: amountPaid || amount,
        description,
        transactionDate: new Date(transactionDateTime),
        referenceCode,
        status: "success",
        verifiedAt: new Date(),
      });
      await transaction.save();
    }

    // Cập nhật order
    const updatedOrder = await Order.findOneAndUpdate(
      { orderCode },
      {
        status: "paid",
        paidAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );

    console.log("✅ Webhook xác nhận thanh toán thành công");

    // ⚠️ PHẢI return 200 để PayOS biết webhook đã xử lý
    return res.status(200).json({
      message: "Webhook processed successfully",
      code: "00",
      desc: "Success",
      data: {
        orderCode: updatedOrder.orderCode,
        status: updatedOrder.status,
      },
    });
  } catch (error: any) {
    console.error("❌ Lỗi xử lý webhook:", error);
    return res.status(200).json({
      message: "Webhook processing error",
      code: "01",
      desc: error.message,
    });
  }
};

// [GET] /api/v1/payments/info
module.exports.getPaymentInfo = async (req, res) => {
  try {
    const paymentInfo = {
      bankName: process.env.PAYMENT_BANK_NAME || "MB Bank",
      accountNumber: process.env.PAYMENT_ACCOUNT_NUMBER,
      accountHolder: process.env.PAYMENT_ACCOUNT_HOLDER,
    };

    return res.status(200).json({
      message: "Lấy thông tin thanh toán thành công!",
      data: paymentInfo,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Lỗi lấy thông tin thanh toán!",
      error: error.message,
    });
  }
};

export {};
