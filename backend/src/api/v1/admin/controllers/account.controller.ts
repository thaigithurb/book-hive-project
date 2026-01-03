import slugify from "slugify";

const Account = require("../../models/account.model");

// [GET] /api/v1/admin/accounts
module.exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const keyword = req.query.keyWord;

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
    }

    const accounts = await Account.find(find)
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await Account.countDocuments(find);

    if (accounts) {
      return res.status(200).json({
        message: "Thành công!",
        accounts: accounts,
        total: total,
        limit: limit,
      });
    }

    return res.status(400).json({
      message: "Không có tài khoản nào",
    });
  } catch (error) {
    return res.status(400).json("Không tìm thấy!");
  }
};

// [PATCH] /api/v1/admin/accounts/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const { id, status } = req.params;

    if (!status) {
      return res.status(404).json({ message: "Không tìm thấy status!" });
    }

    const account = await Account.updateOne(
      {
        _id: id,
      },
      {
        status: status,
      }
    );

    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
    }

    return res.status(200).json({
      message: "Cập nhật trạng thái thành công!",
      account: account,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// [PATCH] /api/v1/admin/accounts/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = Array.isArray(req.body.ids)
      ? req.body.ids
      : req.body.ids.split(", ");

    switch (type) {
      case "active":
        await Account.updateMany({ _id: { $in: ids } }, { status: "active" });
        return res.status(200).json({
          message: `Cập nhật trạng thái thành công ${ids.length} tài khoản!`,
        });
      case "inactive":
        await Account.updateMany({ _id: { $in: ids } }, { status: "inactive" });
        return res.status(200).json({
          message: `Cập nhật trạng thái thành công ${ids.length} tài khoản!`,
        });
      case "delete_all":
        await Account.updateMany(
          { _id: { $in: ids } },
          { deleted: true, deletedAt: new Date() }
        );

        // Sau khi xóa, cập nhật lại position cho các tài khoản còn lại
        const accountsLeft = await Account.find({ deleted: false }).sort({
          position: 1,
        });
        for (let i = 0; i < accountsLeft.length; i++) {
          await Account.updateOne(
            { _id: accountsLeft[i]._id },
            { position: i + 1 }
          );
        }

        return res.status(200).json({
          message: `Đã xóa ${ids.length} tài khoản!`,
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

// [POST] /api/v1/admin/accounts/create
module.exports.create = async (req, res) => {
  try {
    let { fullName, ...newAccData } = req.body;

    const slug = slugify(fullName, { lower: true, strict: true, locale: "vi" });

    // Lấy link ảnh từ file upload
    let avatar = "";
    if (req.file) {
      avatar = req.file.path;
    }

    // tạo acc và lưu acc mới
    const newAcc = new Account({
      ...newAccData,
      avatar,
      slug,
      fullName,
    });
    await newAcc.save();

    return res.status(200).json({
      message: "Tạo mới tài khoản thành công!",
      newAcc: newAcc,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Tạo mới tài khoản thất bại",
    });
  }
};

// [GET] /api/v1/admin/accounts/detail/:slug
module.exports.detail = async (req, res) => {
  try {
    const slug = req.params.slug;
    const account = await Account.findOne({ slug: slug, deleted: false });
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
    }

    return res.status(200).json({
      message: "Lấy thông tin tài khoản thành công!",
      account: account,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Lỗi khi lấy thông tin tài khoản!",
    });
  }
};

// [PATCH] /api/v1/admin/accounts/edit/:slug
module.exports.edit = async (req, res) => {
  try {
    const slug = req.params.slug;

    const account = await Account.findOne({ slug, deleted: false });
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
    }

    const updateData = { ...req.body };
    if (!req.file && (req.body.image === undefined || req.body.image === "")) {
      updateData.image = account.image;
    }
    if (req.file) {
      updateData.image = req.file.path;
    }

    if (req.body.title) {
      updateData.slug = slugify(req.body.title, {
        lower: true,
        strict: true,
        locale: "vi",
      });
    }

    // Cập nhật acc
    await Account.updateOne({ _id: account._id }, updateData);

    return res.status(200).json({
      message: "Cập nhật thông tin thành công!",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Cập nhật thông tin thất bại",
    });
  }
};

// [PATCH] /api/v1/admin/accounts/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    // xóa sách
    await Account.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
      }
    );

    return res.status(200).json({
      message: "Xóa thành công!",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Xóa thất bại",
    });
  }
};
