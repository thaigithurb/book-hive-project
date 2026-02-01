const brevo = require("@getbrevo/brevo");

const sendOrderConfirmationEmail = async (order) => {
  try {
    const { userInfo, orderCode, items, totalAmount } = order;

    if (!process.env.BREVO_API_KEY) {
      return { success: false, error: "Missing BREVO_API_KEY" };
    }

    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

    if (!userInfo?.email || !orderCode) {
      console.error("Missing required email data:", {
        email: userInfo?.email,
        orderCode,
      });
      return { success: false, error: "Missing email or orderCode" };
    }

    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px 5px; border-bottom: 1px solid #ddd; font-size: 14px;">${
          item.title
        }</td>
        <td style="padding: 10px 5px; border-bottom: 1px solid #ddd; text-align: center; white-space: nowrap; font-size: 14px;">x${
          item.quantity
        }</td>
        <td style="padding: 10px 5px; border-bottom: 1px solid #ddd; text-align: right; white-space: nowrap; font-size: 14px;">${(
          item.price * item.quantity
        ).toLocaleString("vi-VN")}₫</td>
      </tr>
    `,
      )
      .join("");

    const trackingLink = `${
      process.env.FRONTEND_URL
    }/order-tracking/${orderCode}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; max-width: 100% !important; }
            .content-padding { padding: 15px !important; }
            .header-padding { padding: 20px !important; }
            .mobile-text-small { font-size: 14px !important; }
            .mobile-stack { display: block !important; width: 100% !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
        <div style="background-color: #f5f5f5; padding: 20px 0;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center">
                <div class="container" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); width: 100%;">
                  
                  <div class="header-padding" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">Đơn Hàng Thành Công</h1>
                    <p style="margin: 10px 0 0 0; font-size: 14px;">BookHive - Cửa hàng sách online</p>
                  </div>

                  <div class="content-padding" style="padding: 30px;">
                    <h2 style="color: #333; margin-top: 0;">Xin chào ${
                      userInfo.fullName
                    },</h2>
                    <p style="color: #666; line-height: 1.6;">
                      Cảm ơn bạn đã mua sắm tại Book Hive! Đơn hàng của bạn đã được tạo thành công và đang chờ xử lý.
                    </p>

                    <div style="background-color: #f0f7ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0; font-size: 12px; color: #666;">Mã Đơn Hàng:</p>
                      <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #667eea; font-family: monospace; word-break: break-all;">
                        ${orderCode}
                      </p>
                    </div>

                    <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📦 Chi Tiết Đơn Hàng</h3>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                      <thead>
                        <tr style="background-color: #f5f5f5;">
                          <th style="padding: 10px 5px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; font-size: 14px;">Sản Phẩm</th>
                          <th style="padding: 10px 5px; text-align: center; font-weight: bold; border-bottom: 2px solid #ddd; font-size: 14px; white-space: nowrap;">SL</th>
                          <th style="padding: 10px 5px; text-align: right; font-weight: bold; border-bottom: 2px solid #ddd; font-size: 14px;">Thành Tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>

                    <div style="text-align: right; padding: 20px 0; border-top: 2px solid #eee;">
                      <p style="margin: 10px 0; font-size: 18px;">
                        <strong>Tổng Cộng:</strong> 
                        <span style="color: #667eea; font-size: 24px; font-weight: bold;">
                          ${totalAmount.toLocaleString("vi-VN")}₫
                        </span>
                      </p>
                    </div>

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

                    <div style="background-color: #f0f7ff; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                      <p style="color: #666; margin: 0 0 15px 0;">Bạn có thể theo dõi đơn hàng tại:</p>
                      <a href="${trackingLink}" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                        🔍 Xem Chi Tiết
                      </a>
                    </div>

                    <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 30px;">📅 Quy Trình Xử Lý</h3>
                    <div style="margin: 20px 0;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 15px;">
                        <tr>
                          <td valign="top" style="width: 40px; text-align: center; font-weight: bold; color: #667eea; font-size: 20px;">1️⃣</td>
                          <td valign="top" style="padding-left: 10px;">
                            <strong style="display: block; margin-bottom: 5px;">Xác Nhận Đơn Hàng</strong>
                            <span style="color: #666; font-size: 14px;">Chúng tôi sẽ xác nhận trong 24 giờ</span>
                          </td>
                        </tr>
                      </table>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 15px;">
                        <tr>
                          <td valign="top" style="width: 40px; text-align: center; font-weight: bold; color: #667eea; font-size: 20px;">2️⃣</td>
                          <td valign="top" style="padding-left: 10px;">
                            <strong style="display: block; margin-bottom: 5px;">Chuẩn Bị Hàng</strong>
                            <span style="color: #666; font-size: 14px;">3-5 ngày làm việc để chuẩn bị</span>
                          </td>
                        </tr>
                      </table>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 15px;">
                        <tr>
                          <td valign="top" style="width: 40px; text-align: center; font-weight: bold; color: #667eea; font-size: 20px;">3️⃣</td>
                          <td valign="top" style="padding-left: 10px;">
                            <strong style="display: block; margin-bottom: 5px;">Giao Hàng</strong>
                            <span style="color: #666; font-size: 14px;">Mã vận chuyển sẽ gửi qua email</span>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0; color: #856404; font-size: 14px;">
                        <strong>❓ Cần Hỗ Trợ?</strong> LH: 
                        <a href="mailto:support@bookhive.com" style="color: #0066cc; text-decoration: none; word-break: break-all;">support@bookhive.com</a>
                      </p>
                    </div>
                  </div>

                  <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
                    <p style="margin: 0; color: #666; font-size: 12px;">
                      © 2026 BookHive. Tất cả quyền được bảo lưu.
                    </p>
                    <p style="margin: 5px 0 0 0; color: #999; font-size: 11px;">
                      Đây là email tự động, vui lòng không trả lời email này.
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: userInfo.email, name: userInfo.fullName }];
    sendSmtpEmail.sender = {
      name: "BookHive",
      email: process.env.BREVO_SENDER_EMAIL || "noreply@bookhive.com",
    };
    sendSmtpEmail.subject = `Đơn Hàng Thành Công - Mã: ${orderCode}`;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.replyTo = {
      email: process.env.BREVO_SENDER_EMAIL || "support@bookhive.com",
    };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", {
      message: error.message,
      email: order?.userInfo?.email,
      orderCode: order?.orderCode,
    });
    return { success: false };
  }
};

module.exports = { sendOrderConfirmationEmail };
