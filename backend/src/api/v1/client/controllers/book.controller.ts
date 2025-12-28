// @ts-ignore
const Book = require("../../models/book.model");
// @ts-ignore
const Category = require("../../models/category.model");

// [GET] /api/v1/books
module.exports.index = async (req, res) => {
  try {
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

// [GET] /api/v1/books/detail/:bookSlug
module.exports.detail = async (req, res) => {
  try {
    const slug = req.params.bookSlug;

    const book = await Book.findOne({
      slug: slug,
      deleted: false,
      status: "active",
    });
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }

    const bookObj = book.toObject();
    if (book.category_id) {
      const category = await Category.findOne({
        _id: book.category_id,
      }).select("title");
      bookObj.category_name = category.title;
    };

    return res.status(200).json({
      message: "Lấy thông tin sách thành công!",
      book: bookObj,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Lỗi khi lấy thông tin sách!",
    });
  }
};
