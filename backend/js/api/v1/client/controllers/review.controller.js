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
const User = require("../../models/user.model");
const Review = require("../../models/review.model");
const Book = require("../../models/book.model");
module.exports.sendReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { bookId, rating, comment } = req.body;
        const existingReview = yield Review.findOne({
            book: bookId,
            user: userId,
        });
        if (existingReview) {
            return res.status(400).json({
                message: "Bạn đã đánh giá sách này rồi",
            });
        }
        const review = new Review({
            book: bookId,
            user: userId,
            rating: rating,
            comment: comment,
        });
        yield review.save();
        const allReviews = yield Review.find({ book: bookId });
        const averageRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length;
        yield Book.findByIdAndUpdate(bookId, {
            rating: Math.round(averageRating * 10) / 10,
            reviews: allReviews.length,
        });
        return res.status(201).json({
            message: "Gửi đánh giá thành công",
            data: review,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Có lỗi khi gửi đánh giá",
            error: error.message,
        });
    }
});
