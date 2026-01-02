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
    const { title, ...newRoleData } = req.body;
    const slug = slugify(title, { lower: true, strict: true, locale: "vi" });

    const newRole = new Role({
      ...newRoleData,
      slug,
      title,
    });
    await newRole.save();
    return res.status(200).json({
      message: "Tạo mới vai trò thành công",
    });
  } catch (error) {
    return res.status(400).json("Tạo mới vai trò thất bại!");
  }
};

// [GET] /api/v1/admin/roles/:slug
module.exports.getBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    const role = await Role.findOne({ slug: slug, deleted: false });
    if (!role) {
      return res.status(404).json({ message: "Không tìm thấy vai trò!" });
    }

    return res.status(200).json({
      message: "Lấy thông tin vai trò thành công!",
      role: role,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Lỗi khi lấy thông tin vai trò!",
    });
  }
};

// [GET] /api/v1/admin/roles/edit/:slug
module.exports.edit = async (req, res) => {
  try {
    const slug = req.params.slug;
    const role = await Role.findOne({
      slug: slug,
    });
    if (!role) {
      res.status(400).json({
        message: "Không tìm thấy vai trò!",
      });
    } else {
      await Role.updateOne({ slug: slug }, req.body);
      res.status(200).json({
        message: "Cập nhật vai trò thành công!",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "Cập nhật vai trò không thành công!",
    });
  }
};

// [GET] /api/v1/admin/roles/permissions
module.exports.permissions = async (req, res) => {
  try {
    const permissions = await Permission.find({});
    const permissionGroups = permissions.reduce((acc: any, perm: any) => {
      const group = perm.group;
      acc[group] = acc[group] || [];
      acc[group].push(perm);
      return acc;
    }, {});
    res.status(200).json({ permissionGroups });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// [PATCH] /api/v1/admin/roles/permissions/edit
module.exports.permissionsEdit = async (req, res) => {
  try {
    const { roles } = req.body;
    for (const role of roles) {
      await Role.findByIdAndUpdate(role._id, { permissions: role.permissions });
    }
    res.status(200).json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// [PATCH] /api/v1/admin/roles/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const role = await Role.findOne({ _id: id });
    if (role) {
      await Role.updateOne({ _id: id }, { deleted: true });
      res.status(200).json({ message: "Đã xóa vai trò!" });
    } else {
      res.status(400).json({ message: "Không tìm thấy vai trò!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// [PATCH] /api/v1/admin/roles/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const type = req.body.type;
    const ids = Array.isArray(req.body.ids)
      ? req.body.ids
      : req.body.ids.split(", ");

    switch (type) {
      case "delete_all":
        await Role.updateMany(
          { _id: { $in: ids } },
          { deleted: true, deletedAt: new Date() }
        );

        return res.status(200).json({
          message: `Đã xóa ${ids.length} vai trò!`,
        });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Cập nhật thất bại!",
    });
  }
};
