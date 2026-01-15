const Book = require("../../models/book.model");
const Category = require("../../models/category.model");

// [GET] /api/v1/books
module.exports.index = async (req, res) => {
  try {
    const keyword = req.query.keyWord;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const find: any = {
      deleted: false,
      status: "active",
    };

    if (keyword) {
      const regex = new RegExp(keyword, "i");
      find.$or = [{ title: regex }, { author: regex }];
    }

    // sort
    let sort: any = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = Number(req.query.sortValue);
    } else {
      sort.position = "desc";
    }

    const books = await Book.find(find).skip(skip).limit(limit).sort(sort);
    const total = await Book.countDocuments(find);

    if (books && books.length > 0) {
      const booksWithCategory = [];

      for (const book of books) {
        const bookObj = book.toObject();
        if (book.category_id) {
          const category = await Category.findOne({
            _id: book.category_id,
          }).select("title");
          bookObj.category_name = category.title;
        }
        booksWithCategory.push(bookObj);
      }

      return res.status(200).json({
        message: "Thành công!",
        books: booksWithCategory,
        total: total,
        limit: limit,
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
    }

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

// [GET] /api/v1/books/featured
module.exports.featured = async (req, res) => {
  try {
    const books = await Book.find({
      deleted: false,
      status: "active",
      featured: true,
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

// [GET] /api/v1/books/rent-only
module.exports.booksRent = async (req, res) => {
  try {
    const keyword = req.query.keyWord;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const find: any = {
      deleted: false,
      status: "active",
      priceBuy: 0,
    };

    if (keyword) {
      const regex = new RegExp(keyword, "i");
      find.$or = [{ title: regex }, { author: regex }];
    }

    let books = [];
    if (req.query.sortKey === "priceRentDay") {
      const type = "day";
      books = await Book.aggregate([
        { $match: find },
        {
          $addFields: {
            priceRentSort: {
              $first: {
                $map: {
                  input: {
                    $filter: {
                      input: "$priceRentOptions",
                      as: "opt",
                      cond: { $eq: ["$$opt.type", type] },
                    },
                  },
                  as: "opt",
                  in: "$$opt.price",
                },
              },
            },
          },
        },
        { $sort: { priceRentSort: Number(req.query.sortValue) } },
        { $skip: skip },
        { $limit: limit },
      ]);
    } else {
      let sort: any = {};
      if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = Number(req.query.sortValue);
      } else {
        sort.position = "desc";
      }
      books = await Book.find(find).skip(skip).limit(limit).sort(sort);
    }

    const total = await Book.countDocuments(find);

    if (books && books.length > 0) {
      const booksWithCategory = [];

      for (const book of books) {
        const bookObj = book;
        if (book.category_id) {
          const category = await Category.findOne({
            _id: book.category_id,
          }).select("title");
          bookObj.category_name = category.title;
        }
        booksWithCategory.push(bookObj);
      }

      return res.status(200).json({
        message: "Thành công!",
        books: booksWithCategory,
        total: total,
        limit: limit,
      });
    }

    return res.status(400).json({
      message: "Không có sách nào",
    });
  } catch (error) {
    res.json("Không tìm thấy!");
  }
};

// [GET] /api/v1/books/buy-only
module.exports.booksBuy = async (req, res) => {
  try {
    const keyword = req.query.keyWord;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const find: any = {
      deleted: false,
      status: "active",
      priceRentOptions: [],
    };

    if (keyword) {
      const regex = new RegExp(keyword, "i");
      find.$or = [{ title: regex }, { author: regex }];
    }

    // sort
    let sort: any = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = Number(req.query.sortValue);
    } else {
      sort.position = "desc";
    }

    const books = await Book.find(find).skip(skip).limit(limit).sort(sort);
    const total = await Book.countDocuments(find);

    if (books && books.length > 0) {
      const booksWithCategory = [];

      for (const book of books) {
        const bookObj = book.toObject();
        if (book.category_id) {
          const category = await Category.findOne({
            _id: book.category_id,
          }).select("title");
          bookObj.category_name = category.title;
        }
        booksWithCategory.push(bookObj);
      }

      return res.status(200).json({
        message: "Thành công!",
        books: booksWithCategory,
        total: total,
        limit: limit,
      });
    }

    return res.status(400).json({
      message: "Không có sách nào",
    });
  } catch (error) {
    res.json("Không tìm thấy!");
  }
};

// [GET] /api/v1/books/newest
module.exports.newest = async (req, res) => {
  try {
    const books = await Book.find({
      deleted: false,
      status: "active",
    }).sort({ createdAt: -1 });

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

export {};
