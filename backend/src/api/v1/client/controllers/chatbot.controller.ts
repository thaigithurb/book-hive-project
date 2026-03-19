const Book = require("../../models/book.model");
const aiService = require("../services/ai.service");

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

    // Tìm các cuốn sách liên quan
    const relatedBooks = await aiService.findRelatedBooks(Book, question, {
      limit: 5,
    });

    // Build context từ các cuốn sách
    const context = aiService.buildContext(relatedBooks);

    // Query AI
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
    const shouldSendBooks =
      !noBookIntents.includes(result.ui?.intent || "") &&
      Array.isArray(relatedBooks) &&
      relatedBooks.length > 0;

    const relatedBooksPayload = shouldSendBooks
      ? relatedBooks.map((book: any) => ({
          id: book._id,
          title: book.title,
          author: book.author,
          price: book.priceBuy,
          rating: book.rating,
          image: book.image,
          slug: book.slug,
          href: book.slug ? `/books/detail/${book.slug}` : undefined,
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
