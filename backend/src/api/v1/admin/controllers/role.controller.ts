// @ts-ignore
const Role = require("../../models/role.model");
const Permission = require("../../models/permission.model");
// @ts-ignore
const slugify = require("slugify");

// [GET] /api/v1/admin/roles
module.exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (page - 1) * limit;
    const keyword = req.query.keyWord;

    const find: any = {
      deleted: false,
    };

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

    const roles = await Role.find(find).skip(skip).limit(limit).sort(sort);

    const total = await Role.countDocuments(find);

    if (roles) {
      return res.status(200).json({
        message: "Thành công!",
        roles: roles,
        total: total,
        limit: limit,
      });
    }

    return res.status(400).json({
      message: "Không có vai trò nào",
    });
  } catch (error) {
    return res.status(400).json("Không tìm thấy!");
  }
};

// [POST] /api/v1/admin/roles/create
module.exports.create = async (req, res) => {
  try {
    const newRole = new Role(req.body);
    await newRole.save();
    return res.status(200).json({
      message: "Tạo mới vai trò thành công"
    });
  } catch (error) {
    return res.status(400).json("Tạo mới vai trò thất bại!");
  }
};

// [GET] /api/v1/admin/roles/permissions
module.exports.permissions = async (req, res) => {
  try {
    const permissions = await Permission.find({});
    res.status(200).json({ permissions });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// [PATCH] /api/v1/admin/roles/edit
// module.exports.edit = async (req, res) => {
//   try {
//     const newRole = new Role(req.body);
//     await newRole.save();
//     return res.status(200).json("Tạo mới vai trò thành công");
//   } catch (error) {
//     return res.status(400).json("Tạo mới vai trò thất bại!");
//   }
// };
