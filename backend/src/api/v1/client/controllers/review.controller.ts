const User = require("../../models/user.model");
const Review = require("../../models/review.model");
const Book = require("../../models/book.model");

// [POST] /api/v1/reviews/send
module.exports.sendReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bookId, rating, comment } = req.body;

    const existingReview = await Review.findOne({
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

    await review.save();

    // Cập nhật rating cho sách
    const allReviews = await Review.find({ book: bookId });
    const averageRating =
      allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length;

    await Book.findByIdAndUpdate(bookId, {
      rating: Math.round(averageRating * 10) / 10,
      reviews: allReviews.length,
    });
    
    return res.status(201).json({
      message: "Gửi đánh giá thành công",
      data: review,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Có lỗi khi gửi đánh giá",
      error: error.message,
    });
  }
};

export {};
