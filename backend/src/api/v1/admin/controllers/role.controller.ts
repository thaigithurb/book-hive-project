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

    const find: any = {
      deleted: false,
    };

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
    res.json("Không tìm thấy!");
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
