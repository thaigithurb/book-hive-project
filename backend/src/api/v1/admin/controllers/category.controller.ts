// @ts-ignore
const Category = require("../../models/category.model");
// @ts-ignore
const slugify = require("slugify");

// [GET] /api/v1/admin/categories
module.exports.index = async (req, res) => {
  try {
    const status = req.query.status;
    const keyword = req.query.keyWord;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit;

    const find: any = {
      deleted: false,
    };

    if (status) {
      find.status = status;
    }

    if (keyword) {
      const regex = new RegExp(keyword, "i");
      find.$or = [{ title: regex }];
    }

    // sort
    let sort: any = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = Number(req.query.sortValue);
    } else {
      sort.position = "desc";
    }

    const categories = await Category.find(find).skip(skip).limit(limit).sort(sort);

    const total = await Category.countDocuments(find);

    if (categories) {
      return res.status(200).json({
        message: "Thành công!",
        categories: categories,
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

// [PATCH] /api/v1/admin/categories/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const { id, status } = req.params;

    if (!status) {
      return res.status(404).json({ message: "Không tìm thấy status!" });
    }

    const category = await Category.updateOne(
      {
        _id: id,
      },
      {
        status: status,
      }
    );

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy sách!" });
    }

    return res.status(200).json({
      message: "Cập nhật trạng thái thành công!",
      category: category,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!" });
  }
};

