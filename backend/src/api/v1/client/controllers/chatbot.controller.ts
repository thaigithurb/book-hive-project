const Book = require("../../models/book.model");
const Category = require("../../models/category.model");
const Order = require("../../models/order.model");
const Review = require("../../models/review.model");
const Cart = require("../../models/cart.model");
const User = require("../../models/user.model");
const aiService = require("../services/ai.service");
const jwt = require("jsonwebtoken");

// [POST] /api/v1/chatbot/query
module.exports.query = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập câu hỏi",
      });
    }

    // 1. Phân tích intent và lấy sách liên quan
    const relatedBooks = await aiService.findRelatedBooks(Book, question, {
      limit: 5,
    });

    // 2. Lấy thông tin người dùng (nếu có token)
    let userData = {
      orders: [],
      cart: null,
      user: null,
    };

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Lấy 3 đơn hàng gần nhất
        userData.orders = await Order.find({ "userInfo.email": decoded.email })
          .sort({ createdAt: -1 })
          .limit(3);

        // Lấy giỏ hàng
        userData.cart = await Cart.findOne({ userId: decoded.id });

        // Lấy thông tin user
        userData.user = await User.findOne({ _id: decoded.id }).select(
          "fullName email",
        );
      } catch (err) {
        console.log("Chatbot Auth optional error:", err.message);
      }
    }

    // 3. Lấy đánh giá (reviews) cho các cuốn sách liên quan
    const bookIds = relatedBooks.map((b) => b._id);
    const relatedReviews = await Review.find({ book: { $in: bookIds } })
      .populate("user", "fullName")
      .populate("book", "title")
      .limit(10);

    // 4. Build context đa tầng
    const context = aiService.buildContext(relatedBooks, {
      orders: userData.orders,
      cart: userData.cart,
      reviews: relatedReviews,
      user: userData.user,
    });

    // 5. Query AI
    const result = await aiService.queryAI(question, context, relatedBooks);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || "Lỗi khi xử lý câu hỏi",
      });
    }

    // Determine if we should send related books
    // Don't send books for: auth, cart, order, payment intents
    const noBookIntents = [
      "auth_login",
      "auth_register",
      "cart",
      "order",
      "payment",
      "general_help",
      "out_of_scope",
    ];
    // Version 4: Chỉ gửi các sách mà AI đã chọn lọc trong ui.cards
    const relatedBooksPayload =
      result.ui && Array.isArray(result.ui.cards) && result.ui.cards.length > 0
        ? result.ui.cards.map((card: any) => ({
            id: card.id,
            title: card.title,
            author: card.author,
            price: card.price,
            rating: card.rating,
            image: card.image,
            slug: card.slug,
            href: card.href,
          }))
        : [];

    return res.status(200).json({
      success: true,
      question: question,
      answer: result.answer,
      ui: result.ui || {},
      related_books: relatedBooksPayload,
    });
  } catch (error: any) {
    console.error("Chatbot Controller Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
};

export {};
