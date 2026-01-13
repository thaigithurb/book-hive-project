"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Role = require("../../models/role.model");
const Permission = require("../../models/permission.model");
const slugify = require("slugify");
module.exports.index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 7;
        const skip = (page - 1) * limit;
        const keyword = req.query.keyWord;
        const find = {
            deleted: false,
        };
        if (keyword) {
            const regex = new RegExp(keyword, "i");
            find.$or = [{ title: regex }];
        }
        let sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = Number(req.query.sortValue);
        }
        const roles = yield Role.find(find)
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .populate("updatedBy", "fullName")
            .populate("createdBy", "fullName")
            .populate("deletedBy", "fullName");
        const total = yield Role.countDocuments(find);
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
    }
    catch (error) {
        return res.status(400).json("Không tìm thấy!");
    }
});
module.exports.create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { title } = _a, newRoleData = __rest(_a, ["title"]);
        const slug = slugify(title, { lower: true, strict: true, locale: "vi" });
        const newRole = new Role(Object.assign(Object.assign({}, newRoleData), { slug,
            title, createdBy: req.user.id }));
        yield newRole.save();
        return res.status(200).json({
            message: "Tạo mới vai trò thành công",
        });
    }
    catch (error) {
        return res.status(400).json("Tạo mới vai trò thất bại!");
    }
});
module.exports.getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const role = yield Role.findOne({ _id: id, deleted: false });
        if (!role) {
            return res.status(404).json({ message: "Không tìm thấy vai trò!" });
        }
        return res.status(200).json({
            message: "Lấy thông tin vai trò thành công!",
            role: role,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Lỗi khi lấy thông tin vai trò!",
        });
    }
});
module.exports.detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const role = yield Role.findOne({ slug });
    if (!role)
        return res.status(404).json({ message: "Không tìm thấy vai trò!" });
    return res.status(200).json({ role });
});
module.exports.edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const role = yield Role.findOne({
            slug: slug,
        });
        if (!role) {
            res.status(400).json({
                message: "Không tìm thấy vai trò!",
            });
        }
        const updateData = Object.assign({}, req.body);
        if (req.body.title) {
            updateData.slug = slugify(req.body.title, {
                lower: true,
                strict: true,
                locale: "vi",
            });
        }
        updateData.updatedBy = req.user.id;
        yield Role.updateOne({ slug: slug }, updateData);
        res.status(200).json({
            message: "Cập nhật vai trò thành công!",
        });
    }
    catch (error) {
        res.status(400).json({
            message: "Cập nhật vai trò không thành công!",
        });
    }
});
module.exports.permissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const permissions = yield Permission.find({
            deleted: false,
        });
        const permissionGroups = permissions.reduce((acc, perm) => {
            const group = perm.group;
            acc[group] = acc[group] || [];
            acc[group].push(perm);
            return acc;
        }, {});
        res.status(200).json({ permissionGroups });
    }
    catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});
module.exports.permissionsEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roles } = req.body;
        for (const role of roles) {
            yield Role.findByIdAndUpdate(role._id, {
                permissions: role.permissions,
                updatedBy: req.user.id,
            });
        }
        res.status(200).json({ message: "Cập nhật thành công" });
    }
    catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});
module.exports.delete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const role = yield Role.findOne({ _id: id });
        if (role) {
            yield Role.updateOne({ _id: id }, { deleted: true, deletedBy: req.user.id, deletedAt: new Date() });
            res.status(200).json({ message: "Đã xóa vai trò!" });
        }
        else {
            res.status(400).json({ message: "Không tìm thấy vai trò!" });
        }
    }
    catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});
module.exports.changeMulti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const type = req.body.type;
        const ids = Array.isArray(req.body.ids)
            ? req.body.ids
            : req.body.ids.split(", ");
        switch (type) {
            case "delete_all":
                yield Role.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date(), deletedBy: req.user.id });
                return res.status(200).json({
                    message: `Đã xóa ${ids.length} vai trò!`,
                });
            default:
                return res.status(400).json({
                    message: "Loại thao tác không hợp lệ!",
                });
        }
    }
    catch (error) {
        return res.status(400).json({
            message: "Cập nhật thất bại!",
        });
    }
});
module.exports.createPerm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, label, group } = req.body;
        const checkKey = yield Permission.findOne({
            key: { $regex: key, $options: "i" },
        });
        const checkLabel = yield Permission.findOne({
            label: { $regex: label, $options: "i" },
        });
        if (checkKey) {
            return res.status(400).json({ message: "Key đã tồn tại!" });
        }
        if (checkLabel) {
            return res.status(400).json({ message: "Quyền đã tồn tại!" });
        }
        const slug = slugify(label, { lower: true, strict: true, locale: "vi" });
        const newPerm = new Permission({
            key,
            label,
            group,
            slug,
            createdBy: req.user.id,
        });
        yield newPerm.save();
        return res.status(200).json({ message: "Tạo quyền mới thành công!" });
    }
    catch (err) {
        console.error("Lỗi tạo permission:", err);
        return res.status(500).json({ message: "Lỗi server" });
    }
});
module.exports.editPerm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const _a = req.body, { key, label } = _a, permData = __rest(_a, ["key", "label"]);
        const perm = yield Permission.findOne({
            slug: slug,
        });
        if (!perm) {
            return res.status(400).json({ message: "Không tìm thấy quyền!" });
        }
        const checkKey = yield Permission.findOne({
            key: { $regex: key, $options: "i" },
            slug: { $ne: slug },
        });
        const checkLabel = yield Permission.findOne({
            label: { $regex: label, $options: "i" },
            slug: { $ne: slug },
        });
        if (checkKey) {
            return res.status(400).json({ message: "Key đã tồn tại!" });
        }
        if (checkLabel) {
            return res.status(400).json({ message: "Quyền đã tồn tại!" });
        }
        const updateData = Object.assign(Object.assign({}, permData), { key, label });
        if (req.body.label) {
            updateData.slug = slugify(req.body.label, {
                lower: true,
                strict: true,
                locale: "vi",
            });
        }
        updateData.updatedBy = req.user.id;
        yield Permission.updateOne({
            slug: slug,
        }, updateData);
        return res.status(200).json({ message: "Cập nhật quyền thành công!" });
    }
    catch (err) {
        return res.status(500).json({ message: "Lỗi server" });
    }
});
module.exports.deletePerm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const perm = yield Permission.findOne({
            _id: id,
        });
        if (!perm) {
            return res.status(400).json({ message: "Không tìm thấy quyền!" });
        }
        yield Permission.updateOne({
            _id: id,
        }, {
            deleted: true,
        });
        return res.status(200).json({ message: "Xóa quyền thành công!" });
    }
    catch (err) {
        return res.status(500).json({ message: "Lỗi server" });
    }
});
module.exports.detailPerm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const perm = yield Permission.findOne({ slug: slug, deleted: false });
        if (!perm) {
            return res.status(404).json({ message: "Không tìm thấy quyền!" });
        }
        return res.status(200).json({
            message: "Lấy thông tin quyền thành công!",
            perm: perm,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Lỗi khi lấy thông tin quyền!",
        });
    }
});
