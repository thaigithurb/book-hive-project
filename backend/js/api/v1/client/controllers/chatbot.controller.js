"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Book = require("../../models/book.model");
const aiService = require("../services/ai.service");
module.exports.query = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { question } = req.body;
        if (!question || question.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập câu hỏi",
            });
        }
        const relatedBooks = yield aiService.findRelatedBooks(Book, question, {
            limit: 5,
        });
        const context = aiService.buildContext(relatedBooks);
        const result = yield aiService.queryAI(question, context, relatedBooks);
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error || "Lỗi khi xử lý câu hỏi",
            });
        }
        const noBookIntents = [
            "auth_login",
            "auth_register",
            "cart",
            "order",
            "payment",
            "general_help",
            "out_of_scope",
        ];
        const shouldSendBooks = !noBookIntents.includes(((_a = result.ui) === null || _a === void 0 ? void 0 : _a.intent) || "") &&
            Array.isArray(relatedBooks) &&
            relatedBooks.length > 0;
        const relatedBooksPayload = shouldSendBooks
            ? relatedBooks.map((book) => ({
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
    }
    catch (error) {
        console.error("Chatbot Controller Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ",
            error: error.message,
        });
    }
});
