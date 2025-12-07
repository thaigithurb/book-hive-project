// @ts-ignore
const Book = require("../../models/book.model");

// [GET] /api/v1/home
module.exports.index = async (req, res) => {
  try {
    // Hiển thị sản phẩm mới nhất 
    const books = await Book.find({
      deleted: false,
      status: "active",
    }).sort({ position: -1 });

    if (books) {
      return res.status(200).json({
        message: "Thành công!",
        books: books,
      });
    }

    return res.status(400).json({
      message: "Không có sách nào",
    });
  } catch (error) {
    res.json("Không tìm thấy!");
  }
};
