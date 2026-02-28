const User = require("../../models/user.model");
const Review = require("../../models/review.model");
const Book = require("../../models/book.model");

// [GET] /api/v1/reviews/:bookId
module.exports.bookReviews = async (req, res) => {
  try {
    const bookId = req.params.bookId;

    if (!bookId) {
      return res.status(400).json({
        message: "Không có bookId",
      });
    }

    const records = await Review.find({
      book: bookId,
    })
      .populate("user", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      records: records,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách đánh giá",
      error: error.message,
    });
  }
};

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

// [GET] /api/v1/reviews/my-review/:bookId
module.exports.myReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookId = req.params.bookId;

    const record = await Review.findOne({
      user: userId,
      book: bookId,
    });

    if (!record) {
      return res.status(400).json({
        message: "Không tìm thấy đánh giá nào!",
      });
    }

    res.status(200).json({
      record: record,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy đánh giá riêng",
      error: error.message,
    });
  }
};

export {};
