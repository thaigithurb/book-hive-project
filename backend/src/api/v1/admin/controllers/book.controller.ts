// @ts-ignore
const Book = require("../../models/book.model");
// @ts-ignore
const slugify = require("slugify");

// [GET] /api/v1/admin/books
module.exports.index = async (req, res) => {
  try {
    const status = req.query.status;
    const keyword = req.query.keyWord;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const find: any = {
      deleted: false,
    };

    if (status) {
      find.status = status;
    }

    if (keyword) {
      const regex = new RegExp(keyword, "i");
      find.$or = [{ title: regex }, { author: regex }, { category: regex }];
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

    if (books) {
      return res.status(200).json({
        message: "Thành công!",
        books: books,
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

// [PATCH] /api/v1/admin/books/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const { id, status } = req.params;

    if (!status) {
      return res.status(404).json({ message: "Không tìm thấy status!" });
    }

    const book = await Book.updateOne(
      {
        _id: id,
      },
      {
        status: status,
      }
    );

    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }

    return res.status(200).json({
      message: "Cập nhật trạng thái thành công!",
      book: book,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// [PATCH] /api/v1/admin/books/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
      case "active":
        await Book.updateMany({ _id: { $in: ids } }, { status: "active" });
        return res.status(200).json({
          message: `Cập nhật trạng thái thành công ${ids.length} sách!`,
        });
      case "inactive":
        await Book.updateMany(
          { _id: { $in: ids } },
          { status: "inactive" }
        );
        return res.status(200).json({
          message: `Cập nhật trạng thái thành công ${ids.length} sách!`,
        });
      case "delete":
        await Book.updateMany(
          { _id: { $in: ids } },
          { deleted: true, deletedAt: new Date() }
        );

        // Sau khi xóa, cập nhật lại position cho các sách còn lại
        const booksLeft = await Book.find({ deleted: false }).sort({
          position: 1,
        });
        for (let i = 0; i < booksLeft.length; i++) {
          await Book.updateOne(
            { _id: booksLeft[i]._id },
            { position: i + 1 }
          );
        }

        return res.status(200).json({
          message: `Đã xóa ${ids.length} sách!`,
        });
      case "position-change":
        // Nếu chỉ gửi 1 item, ví dụ ["idX-6"]
        if (ids.length === 1) {
          const [id, newPosStr] = ids[0].split("-");
          const newPos = parseInt(newPosStr);

          // Lấy sách hiện tại
          const currentBook = await Book.findById(id);
          if (!currentBook) {
            return res.status(404).json({ message: "Không tìm thấy sách!" });
          }
          const oldPos = currentBook.position;

          if (oldPos === newPos) {
            // Không đổi gì
            break;
          }

          if (oldPos < newPos) {
            // Dời lên: giảm position của các sách nằm giữa oldPos+1 và newPos
            await Book.updateMany(
              { position: { $gt: oldPos, $lte: newPos } },
              { $inc: { position: -1 } }
            );
          } else {
            // Dời xuống: tăng position của các sách nằm giữa newPos và oldPos-1
            await Book.updateMany(
              { position: { $gte: newPos, $lt: oldPos } },
              { $inc: { position: 1 } }
            );
          }

          // Cập nhật position cho sách được đổi
          await Book.updateOne({ _id: id }, { position: newPos });

          const books = await Book.find({}).sort({ position: 1 });
          return res.status(200).json({
            message: `Cập nhật vị trí thành công!`,
            books: books,
          });
        }

        // Nếu gửi nhiều item
        for (let i = 0; i < ids.length; i++) {
          const [id] = ids[i].split("-");
          await Book.updateOne({ _id: id }, { position: i + 1 });
        }
        const books = await Book.find({}).sort({ position: 1 });
        return res.status(200).json({
          message: `Cập nhật vị trí thành công cho ${ids.length} sách!`,
          books: books,
        });
      default:
        return res.status(400).json({
          message: "Loại thao tác không hợp lệ!",
        });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Cập nhật thất bại!",
    });
  }
};

// [PATCH] /api/v1/admin/books/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    // xóa sách
    await Book.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
      }
    );

    // Cập nhật lại position cho các sách còn lại
    const booksLeft = await Book.find({ deleted: false }).sort({
      position: 1,
    });
    for (let i = 0; i < booksLeft.length; i++) {
      await Book.updateOne({ _id: booksLeft[i]._id }, { position: i + 1 });
    }

    return res.status(200).json({
      message: "Xóa thành công!",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Xóa thất bại",
    });
  }
};

// [POST] /api/v1/admin/books/create
module.exports.create = async (req, res) => {
  try {
    let { position, title, ...newBookData } = req.body;

    const slug = slugify(title, { lower: true, strict: true, locale: "vi" });

    const priceBuy = req.body.priceBuy ? Number(req.body.priceBuy) : 0;
    const priceRent = req.body.priceRent ? Number(req.body.priceRent) : 0;

    // Lấy link ảnh từ file upload
    let image = "";
    if (req.file) {
      image = req.file.path;
    }

    const maxBook = await Book.findOne({
      deleted: false,
    }).sort({ position: -1 });

    const maxPosition = maxBook ? maxBook.position : 0;

    if (!position) {
      position = maxPosition + 1;
    } else {
      // Nếu nhập vị trí hợp lệ, dồn các sách phía sau lên 1
      await Book.updateMany(
        { position: { $gte: position } },
        { $inc: { position: 1 } }
      );
    }

    // tạo sách và lưu sách mới
    const newBook = new Book({
      ...newBookData,
      position,
      image,
      priceBuy,
      priceRent,
      slug,
      title,
    });
    await newBook.save();

    return res.status(200).json({
      message: "Tạo mới sản phẩm thành công!",
      newBook: newBook,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Tạo mới sản phẩm thất bại",
    });
  }
};

// [GET] /api/v1/admin/books/:slug
module.exports.getBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const book = await Book.findOne({ slug: slug, deleted: false });
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }
    return res.status(200).json({
      message: "Lấy thông tin sách thành công!",
      book: book,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Lỗi khi lấy thông tin sách!",
    });
  }
};

// [PATCH] /api/v1/admin/books/edit/:slug
module.exports.edit = async (req, res) => {
  try {
    const slug = req.params.slug;

    const book = await Book.findOne({ slug, deleted: false });
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }

    const oldPos = book.position;
    const newPos = Number(req.body.position);

    if (newPos && newPos !== oldPos) {
      if (oldPos < newPos) {
        await Book.updateMany(
          { position: { $gt: oldPos, $lte: newPos }, deleted: false },
          { $inc: { position: -1 } }
        );
      } else {
        await Book.updateMany(
          { position: { $gte: newPos, $lt: oldPos }, deleted: false },
          { $inc: { position: 1 } }
        );
      }
    }

    const updateData = { ...req.body, position: newPos || oldPos };
    if (!req.file && (req.body.image === undefined || req.body.image === "")) {
      updateData.image = book.image;
    }
    if (req.file) {
      updateData.image = req.file.path;
    }

    // Cập nhật sách
    await Book.updateOne(
      { _id: book._id },
      updateData
    );

    return res.status(200).json({
      message: "Cập nhật thông tin thành công!",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Cập nhật thông tin thất bại",
    });
  }
};

// [GET] /api/v1/admin/books/detail/:slug
module.exports.detail = async (req, res) => {
  try {
    const slug = req.params.slug;
    const book = await Book.findOne({ slug: slug, deleted: false });
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }
    return res.status(200).json({
      message: "Lấy thông tin sách thành công!",
      book: book,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Lỗi khi lấy thông tin sách!",
    });
  }
};
