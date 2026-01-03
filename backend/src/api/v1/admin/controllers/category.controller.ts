const Category = require("../../models/category.model");
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

    const categories = await Category.find(find)
      .skip(skip)
      .limit(limit)
      .sort(sort);

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
      message: "Không có thể loại nào",
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
      return res.status(404).json({ message: "Không tìm thấy thể loại!" });
    }

    return res.status(200).json({
      message: "Cập nhật trạng thái thành công!",
      category: category,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// [PATCH] /api/v1/admin/categories/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = Array.isArray(req.body.ids)
      ? req.body.ids
      : req.body.ids.split(", ");

    switch (type) {
      case "active":
        await Category.updateMany({ _id: { $in: ids } }, { status: "active" });
        return res.status(200).json({
          message: `Cập nhật trạng thái thành công ${ids.length} thể loại!`,
        });
      case "inactive":
        await Category.updateMany(
          { _id: { $in: ids } },
          { status: "inactive" }
        );
        return res.status(200).json({
          message: `Cập nhật trạng thái thành công ${ids.length} thể loại!`,
        });
      case "delete_all":
        await Category.updateMany(
          { _id: { $in: ids } },
          { deleted: true, deletedAt: new Date() }
        );

        // Sau khi xóa, cập nhật lại position cho các thể loại còn lại
        const categoriesLeft = await Category.find({ deleted: false }).sort({
          position: 1,
        });
        for (let i = 0; i < categoriesLeft.length; i++) {
          await Category.updateOne(
            { _id: categoriesLeft[i]._id },
            { position: i + 1 }
          );
        }

        return res.status(200).json({
          message: `Đã xóa ${ids.length} thể loại!`,
        });
      case "position-change":
        // Nếu chỉ gửi 1 item
        if (ids.length === 1) {
          const [id, newPosStr] = ids[0].split("-");
          const newPos = parseInt(newPosStr);

          const currentCategory = await Category.findById(id);
          if (!currentCategory) {
            return res
              .status(404)
              .json({ message: "Không tìm thấy thể loại!" });
          }
          const oldPos = currentCategory.position;

          if (oldPos === newPos) {
            break;
          }

          if (oldPos < newPos) {
            await Category.updateMany(
              { position: { $gt: oldPos, $lte: newPos }, deleted: false },
              { $inc: { position: -1 } }
            );
          } else {
            await Category.updateMany(
              { position: { $gte: newPos, $lt: oldPos }, deleted: false },
              { $inc: { position: 1 } }
            );
          }

          await Category.updateOne({ _id: id }, { position: newPos });

          const categories = await Category.find({ deleted: false }).sort({
            position: 1,
          });
          return res.status(200).json({
            message: `Cập nhật vị trí thành công!`,
            categories: categories,
          });
        }

        // Nếu gửi nhiều item
        //Cập nhật vị trí cho các thể loại đã chọn
        for (let i = 0; i < ids.length; i++) {
          const [id, newPosStr] = ids[i].split("-");
          const newPos = parseInt(newPosStr);
          await Category.updateOne({ _id: id }, { position: newPos });
        }

        // Sắp xếp lại vị trí cho tất cả thể loại để tránh trùng/thiếu
        const allCategories = await Category.find({ deleted: false }).sort({
          position: 1,
        });
        for (let i = 0; i < allCategories.length; i++) {
          await Category.updateOne(
            { _id: allCategories[i]._id },
            { position: i + 1 }
          );
        }

        const categories = await Category.find({ deleted: false }).sort({
          position: 1,
        });
        return res.status(200).json({
          message: `Cập nhật vị trí thành công cho ${ids.length} thể loại!`,
          categories: categories,
        });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Cập nhật thất bại!",
    });
  }
};

// [PATCH] /api/v1/admin/categories/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    // xóa thể loại
    await Category.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
      }
    );

    // Cập nhật lại position cho các thể loại còn lại
    const categoriesLeft = await Category.find({ deleted: false }).sort({
      position: 1,
    });
    for (let i = 0; i < categoriesLeft.length; i++) {
      await Category.updateOne(
        { _id: categoriesLeft[i]._id },
        { position: i + 1 }
      );
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

// [POST] /api/v1/admin/categories/create
module.exports.create = async (req, res) => {
  try {
    let { position, title, ...newCategoryData } = req.body;

    const slug = slugify(title, { lower: true, strict: true, locale: "vi" });

    const maxCategory = await Category.findOne({
      deleted: false,
    }).sort({ position: -1 });

    const maxPosition = maxCategory ? maxCategory.position : 0;

    if (!position) {
      position = maxPosition + 1;
    } else {
      // Nếu nhập vị trí hợp lệ, dồn các thể loại phía sau lên 1
      await maxCategory.updateMany(
        { position: { $gte: position } },
        { $inc: { position: 1 } }
      );
    }

    // tạo thể loại và lưu thể loại mới
    const newCategory = new Category({
      ...newCategoryData,
      position,
      slug,
      title,
    });
    await newCategory.save();

    return res.status(200).json({
      message: "Tạo mới sản phẩm thành công!",
      newCategory: newCategory,
    });
  } catch (error) {
    return res.status(400).json({
      error: error,
      message: "Tạo mới sản phẩm thất bại",
    });
  }
};

// [GET] /api/v1/admin/categories/:slug
module.exports.getBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const category = await Category.findOne({ slug: slug, deleted: false });
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy thể loại!" });
    }

    return res.status(200).json({
      message: "Lấy thông tin thể loại thành công!",
      category: category,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Lỗi khi lấy thông tin thể loại!",
    });
  }
};

// [PATCH] /api/v1/admin/categories/edit/:slug
module.exports.edit = async (req, res) => {
  try {
    const slug = req.params.slug;

    const category = await Category.findOne({ slug, deleted: false });
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy thể loại!" });
    }

    const oldPos = category.position;
    const newPos = Number(req.body.position);

    if (newPos && newPos !== oldPos) {
      if (oldPos < newPos) {
        await Category.updateMany(
          { position: { $gt: oldPos, $lte: newPos }, deleted: false },
          { $inc: { position: -1 } }
        );
      } else {
        await Category.updateMany(
          { position: { $gte: newPos, $lt: oldPos }, deleted: false },
          { $inc: { position: 1 } }
        );
      }
    }

    let updateData: any = { ...req.body };
    if (req.body.title) {
      updateData.slug = slugify(req.body.title, {
        lower: true,
        strict: true,
        locale: "vi",
      });
    }

    // Cập nhật thể loại
    await Category.updateOne({ _id: category._id }, updateData);

    return res.status(200).json({
      message: "Cập nhật thông tin thành công!",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Cập nhật thông tin thất bại",
    });
  }
};

export {};
