var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Role = require("../../models/role.model");
const Permission = require("../../models/permission.model");
const slugify = require("slugify");
module.exports.index = (req, res) => __awaiter(this, void 0, void 0, function* () {
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
        else {
            sort.position = "desc";
        }
        const roles = yield Role.find(find).skip(skip).limit(limit).sort(sort);
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
module.exports.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const newRole = new Role(req.body);
        yield newRole.save();
        return res.status(200).json({
            message: "Tạo mới vai trò thành công"
        });
    }
    catch (error) {
        return res.status(400).json("Tạo mới vai trò thất bại!");
    }
});
module.exports.permissions = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const permissions = yield Permission.find({});
        res.status(200).json({ permissions });
    }
    catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});
