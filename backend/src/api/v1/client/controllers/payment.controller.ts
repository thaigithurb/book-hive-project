const { PayOS } = require("@payos/node");
const Order = require("../../models/order.model");
const Rental = require("../../models/rental.model");
const Transaction = require("../../models/transaction.model");
const { sendOrderConfirmationEmail } = require("../../../../helpers/sendEmail");
const { generateDescriptionCode } = require("../../../../helpers/generate");

const payOS = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

// Tìm document bằng code
const findDocumentByCode = async (code) => {
  let document = await Order.findOne({ orderCode: String(code) });
  if (document) return { document, type: "order" };

  document = await Rental.findOne({ rentalCode: String(code) });
  if (document) return { document, type: "rental" };

  return { document: null, type: null };
};

// [POST] /api/v1/payment/create-combined
module.exports.createCombinedPaymentLink = async (req, res) => {
  try {
    const { codes, amount, items } = req.body;

    if (!codes || codes.length === 0) {
      return res.status(400).json({
        error: -1,
        message: "Không có mã đơn hàng!",
      });
    }

    const documents = [];
    for (const code of codes) {
      const { document, type } = await findDocumentByCode(code);
      if (document) {
        documents.push({ code, document, type });
      }
    }

    if (documents.length === 0) {
      return res.status(404).json({
        error: -1,
        message: "Không tìm thấy đơn hàng nào!",
      });
    }

    for (const doc of documents) {
      if (
        doc.document.isExpired ||
        (doc.document.expiredAt && new Date() > doc.document.expiredAt)
      ) {
        doc.document.status = "cancelled";
        doc.document.isExpired = true;
        await doc.document.save();

        const typeLabel = doc.type === "rental" ? "Đơn thuê" : "Đơn hàng";
        return res.status(400).json({
          error: -1,
          message: `${typeLabel} ${doc.code} đã hết hạn`,
        });
      }
    }

    const mainCode = codes[0];
    const cancelUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/cart`;
    const returnUrl = `${process.env.FRONTEND_URL}/order-success?codes=${encodeURIComponent(codes.join(","))}`;

    const descriptionCode = generateDescriptionCode();

    const paymentLink = await payOS.paymentRequests.create({
      orderCode: Number(String(mainCode).replace(/\D/g, "")),
      amount: Number(amount),
      description: descriptionCode,
      items: items || [],
      cancelUrl,
      returnUrl,
    });

    for (const doc of documents) {
      doc.document.checkoutUrl = paymentLink.checkoutUrl;
      await doc.document.save();
    }

    return res.json({
      error: 0,
      message: "Tạo link thanh toán thành công",
      data: {
        checkoutUrl: paymentLink.checkoutUrl,
        codes: codes,
        amount: amount,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi tạo link:", err);
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
    console.log("👉 [WEBHOOK] Đã nhận được request từ PayOS");
    console.log("👉 [WEBHOOK] Body:", JSON.stringify(req.body, null, 2));

    const { code, desc, data } = req.body;
    if (code === "00" && desc === "success") {
      const orderCode = String(data.orderCode);

      // Tối ưu: Chỉ tìm đơn hàng khớp với orderCode thay vì load toàn bộ DB
      const order = await Order.findOne({ orderCode: orderCode });
      const rental = await Rental.findOne({ rentalCode: orderCode });

      const paidDocuments: { doc: any; type: "order" | "rental" }[] = [];

      if (order) {
        if (order.status === "pending") {
        order.status = "paid";
        await order.save();
        paidDocuments.push({ doc: order, type: "order" });

        await new Transaction({
          orderCode: String(order.orderCode),
          bankCode: data.counterAccountBankId,
          accountNo: data.accountNumber,
          amount: data.amount,
          description: data.description,
          transactionDate: data.transactionDateTime
            ? new Date(data.transactionDateTime)
            : new Date(),
          status: "success",
          verifiedAt: new Date(),
        }).save();
        } else {
          console.log(`⚠️ Đơn hàng ${orderCode} đã được xử lý trước đó (Status: ${order.status}).`);
        }
      }

      if (rental) {
        if (rental.status === "pending") {
        rental.status = "renting";
        rental.rentedAt = new Date();
        await rental.save();
        paidDocuments.push({ doc: rental, type: "rental" });

        await new Transaction({
          orderCode: String(rental.rentalCode),
          bankCode: data.counterAccountBankId,
          accountNo: data.accountNumber,
          amount: data.amount,
          description: data.description,
          transactionDate: data.transactionDateTime
            ? new Date(data.transactionDateTime)
            : new Date(),
          status: "success",
          verifiedAt: new Date(),
        }).save();
        } else {
          console.log(`⚠️ Đơn thuê ${orderCode} đã được xử lý trước đó (Status: ${rental.status}).`);
        }
      }

      try {
        if (paidDocuments.length === 1) {
          const { doc, type } = paidDocuments[0];
          const emailOrder = {
            userInfo: doc.userInfo,
            orderCode: type === "order" ? doc.orderCode : doc.rentalCode,
            items: doc.items || [],
            totalAmount: doc.totalAmount || 0,
          };
          console.log("[Webhook] Gửi mail với đơn 1:", emailOrder);
          await sendOrderConfirmationEmail(emailOrder);
        } else if (paidDocuments.length > 1) {
          const firstDoc = paidDocuments[0].doc;
          const userInfo = firstDoc.userInfo;
          const combinedCode = paidDocuments
            .map((d) =>
              d.type === "order" ? d.doc.orderCode : d.doc.rentalCode,
            )
            .join(", ");
          const combinedItems = paidDocuments.flatMap((d) => d.doc.items || []);
          const combinedTotal = paidDocuments.reduce(
            (sum, d) => sum + (d.doc.totalAmount || 0),
            0,
          );
          const combinedOrder = {
            userInfo,
            orderCode: combinedCode,
            items: combinedItems,
            totalAmount: combinedTotal,
          };
          console.log("[Webhook] Gửi mail với đơn gộp:", combinedOrder);
          await sendOrderConfirmationEmail(combinedOrder);
        } else {
          console.log("[Webhook] Không có đơn nào để gửi mail.");
        }
      } catch (emailErr) {
        console.error("Lỗi gửi email xác nhận đơn:", emailErr);
      }
    }

    return res.json({ message: "OK" });
  } catch (err) {
    console.error("Lỗi webhook:", err);
    return res.status(500).json({ message: "Lỗi xử lý webhook" });
  }
};

module.exports.cancelPaymentLink = async (req, res) => {
  try {
    const { code } = req.params;
    console.log("Cancel request với code:", code);

    const { document, type } = await findDocumentByCode(code);

    if (!document) {
      return res.status(404).json({
        error: -1,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    if (document.status === "paid") {
      return res.status(400).json({
        error: -1,
        message: "Đã thanh toán, không thể hủy",
      });
    }

    document.status = "cancelled";
    document.isExpired = true;
    await document.save();

    try {
      const orderCode = Number(String(code).replace(/\D/g, ""));
      await payOS.paymentRequests.cancel(orderCode);
    } catch (e) {
      console.log("Không hủy được trên PayOS:", e.message);
    }

    return res.json({
      error: 0,
      message: "Hủy thành công",
      type: type,
      code: code,
    });
  } catch (err) {
    console.error("❌ Lỗi hủy:", err);
    return res.status(500).json({
      error: -1,
      message: "Lỗi hủy",
    });
  }
};

export {};
