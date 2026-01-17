var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
console.log("✅ Resend email service initialized");
const sendOrderConfirmationEmail = (order) => __awaiter(this, void 0, void 0, function* () {
    var _a;
    try {
        const { userInfo, orderCode, items, totalAmount } = order;
        if (!(userInfo === null || userInfo === void 0 ? void 0 : userInfo.email) || !orderCode) {
            console.error("❌ Missing required email data:", {
                email: userInfo === null || userInfo === void 0 ? void 0 : userInfo.email,
                orderCode,
            });
            return { success: false, error: "Missing email or orderCode" };
        }
        const itemsHtml = items
            .map((item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">x${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${(item.price * item.quantity).toLocaleString("vi-VN")}₫</td>
      </tr>
    `)
            .join("");
        const trackingLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/order-tracking/${orderCode}`;
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">✅ Đơn Hàng Thành Công</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Book Hive - Cửa hàng sách online</p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Xin chào ${userInfo.fullName},</h2>
            <p style="color: #666; line-height: 1.6;">
              Cảm ơn bạn đã mua sắm tại Book Hive! Đơn hàng của bạn đã được tạo thành công và đang chờ xử lý.
            </p>

            <!-- Order Code -->
            <div style="background-color: #f0f7ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px; color: #666;">Mã Đơn Hàng:</p>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #667eea; font-family: monospace;">
                ${orderCode}
              </p>
            </div>

            <!-- Order Details -->
            <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📦 Chi Tiết Đơn Hàng</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd;">Sản Phẩm</th>
                  <th style="padding: 10px; text-align: center; font-weight: bold; border-bottom: 2px solid #ddd;">Số Lượng</th>
                  <th style="padding: 10px; text-align: right; font-weight: bold; border-bottom: 2px solid #ddd;">Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Total -->
            <div style="text-align: right; padding: 20px 0; border-top: 2px solid #eee;">
              <p style="margin: 10px 0; font-size: 18px;">
                <strong>Tổng Cộng:</strong> 
                <span style="color: #667eea; font-size: 24px; font-weight: bold;">
                  ${totalAmount.toLocaleString("vi-VN")}₫
                </span>
              </p>
            </div>

            <!-- Customer Info -->
            <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 30px;">👤 Thông Tin Giao Hàng</h3>
            <p style="color: #666; margin: 10px 0;">
              <strong>Người Nhận:</strong> ${userInfo.fullName}
            </p>
            <p style="color: #666; margin: 10px 0;">
              <strong>Địa Chỉ:</strong> ${userInfo.address}
            </p>
            <p style="color: #666; margin: 10px 0;">
              <strong>Điện Thoại:</strong> ${userInfo.phone}
            </p>

            <!-- Tracking Link -->
            <div style="background-color: #f0f7ff; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="color: #666; margin: 0 0 15px 0;">Bạn có thể theo dõi đơn hàng tại:</p>
              <a href="${trackingLink}" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                🔍 Xem Chi Tiết Đơn Hàng
              </a>
            </div>

            <!-- Timeline -->
            <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 30px;">📅 Quy Trình Xử Lý Đơn Hàng</h3>
            <div style="margin: 20px 0;">
              <div style="display: flex; margin: 15px 0;">
                <div style="width: 40px; text-align: center; font-weight: bold; color: #667eea;">1️⃣</div>
                <div style="flex: 1;">
                  <strong>Xác Nhận Đơn Hàng</strong>
                  <p style="margin: 5px 0; color: #666; font-size: 14px;">Chúng tôi sẽ xác nhận trong 24 giờ</p>
                </div>
              </div>
              <div style="display: flex; margin: 15px 0;">
                <div style="width: 40px; text-align: center; font-weight: bold; color: #667eea;">2️⃣</div>
                <div style="flex: 1;">
                  <strong>Chuẩn Bị Hàng</strong>
                  <p style="margin: 5px 0; color: #666; font-size: 14px;">3-5 ngày làm việc để chuẩn bị và đóng gói</p>
                </div>
              </div>
              <div style="display: flex; margin: 15px 0;">
                <div style="width: 40px; text-align: center; font-weight: bold; color: #667eea;">3️⃣</div>
                <div style="flex: 1;">
                  <strong>Giao Hàng</strong>
                  <p style="margin: 5px 0; color: #666; font-size: 14px;">Chúng tôi sẽ gửi mã vận chuyển qua email</p>
                </div>
              </div>
            </div>

            <!-- Support -->
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404;">
                <strong>❓ Cần Hỗ Trợ?</strong> Liên hệ với chúng tôi tại 
                <a href="mailto:support@bookhive.com" style="color: #0066cc; text-decoration: none;">support@bookhive.com</a>
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              © 2026 Book Hive. Tất cả quyền được bảo lưu.
            </p>
            <p style="margin: 5px 0 0 0; color: #999; font-size: 11px;">
              Đây là email tự động, vui lòng không trả lời email này.
            </p>
          </div>
        </div>
      </div>
    `;
        console.log(`📧 Sending email to ${userInfo.email}...`);
        const data = yield resend.emails.send({
            from: `Book Hive <onboarding@resend.dev>`,
            to: userInfo.email,
            subject: `✅ Đơn Hàng Thành Công - Mã: ${orderCode}`,
            html: htmlContent,
        });
        if (data.error) {
            throw data.error;
        }
        console.log(`✅ Email sent successfully to ${userInfo.email} - ID: ${data.data.id}`);
        return { success: true, messageId: data.data.id };
    }
    catch (error) {
        console.error("❌ Error sending email:", {
            message: error.message,
            email: (_a = order === null || order === void 0 ? void 0 : order.userInfo) === null || _a === void 0 ? void 0 : _a.email,
            orderCode: order === null || order === void 0 ? void 0 : order.orderCode,
        });
        return { success: false, error: error.message };
    }
});
module.exports = { sendOrderConfirmationEmail };
