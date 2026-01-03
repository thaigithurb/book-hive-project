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
const Category = require("../../models/category.model");
const slugify = require("slugify");
module.exports.index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const status = req.query.status;
        const keyword = req.query.keyWord;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 7;
        const skip = (page - 1) * limit;
        const find = {
            deleted: false,
        };
        if (status) {
            find.status = status;
        }
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
        const categories = yield Category.find(find)
            .skip(skip)
            .limit(limit)
            .sort(sort);
        const total = yield Category.countDocuments(find);
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
    }
    catch (error) {
        res.json("Không tìm thấy!");
    }
});
module.exports.changeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, status } = req.params;
        if (!status) {
            return res.status(404).json({ message: "Không tìm thấy status!" });
        }
        const category = yield Category.updateOne({
            _id: id,
        }, {
            status: status,
        });
        if (!category) {
            return res.status(404).json({ message: "Không tìm thấy thể loại!" });
        }
        return res.status(200).json({
            message: "Cập nhật trạng thái thành công!",
            category: category,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi server!" });
    }
});
module.exports.changeMulti = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const type = req.body.type;
        const ids = Array.isArray(req.body.ids)
            ? req.body.ids
            : req.body.ids.split(", ");
        switch (type) {
            case "active":
                yield Category.updateMany({ _id: { $in: ids } }, { status: "active" });
                return res.status(200).json({
                    message: `Cập nhật trạng thái thành công ${ids.length} thể loại!`,
                });
            case "inactive":
                yield Category.updateMany({ _id: { $in: ids } }, { status: "inactive" });
                return res.status(200).json({
                    message: `Cập nhật trạng thái thành công ${ids.length} thể loại!`,
                });
            case "delete_all":
                yield Category.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date() });
                const categoriesLeft = yield Category.find({ deleted: false }).sort({
                    position: 1,
                });
                for (let i = 0; i < categoriesLeft.length; i++) {
                    yield Category.updateOne({ _id: categoriesLeft[i]._id }, { position: i + 1 });
                }
                return res.status(200).json({
                    message: `Đã xóa ${ids.length} thể loại!`,
                });
            case "position-change":
                if (ids.length === 1) {
                    const [id, newPosStr] = ids[0].split("-");
                    const newPos = parseInt(newPosStr);
                    const currentCategory = yield Category.findById(id);
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
                        yield Category.updateMany({ position: { $gt: oldPos, $lte: newPos }, deleted: false }, { $inc: { position: -1 } });
                    }
                    else {
                        yield Category.updateMany({ position: { $gte: newPos, $lt: oldPos }, deleted: false }, { $inc: { position: 1 } });
                    }
                    yield Category.updateOne({ _id: id }, { position: newPos });
                    const categories = yield Category.find({ deleted: false }).sort({
                        position: 1,
                    });
                    return res.status(200).json({
                        message: `Cập nhật vị trí thành công!`,
                        categories: categories,
                    });
                }
                for (let i = 0; i < ids.length; i++) {
                    const [id, newPosStr] = ids[i].split("-");
                    const newPos = parseInt(newPosStr);
                    yield Category.updateOne({ _id: id }, { position: newPos });
                }
                const allCategories = yield Category.find({ deleted: false }).sort({
                    position: 1,
                });
                for (let i = 0; i < allCategories.length; i++) {
                    yield Category.updateOne({ _id: allCategories[i]._id }, { position: i + 1 });
                }
                const categories = yield Category.find({ deleted: false }).sort({
                    position: 1,
                });
                return res.status(200).json({
                    message: `Cập nhật vị trí thành công cho ${ids.length} thể loại!`,
                    categories: categories,
                });
        }
    }
    catch (error) {
        return res.status(400).json({
            message: "Cập nhật thất bại!",
        });
    }
});
module.exports.delete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield Category.updateOne({
            _id: id,
        }, {
            deleted: true,
        });
        const categoriesLeft = yield Category.find({ deleted: false }).sort({
            position: 1,
        });
        for (let i = 0; i < categoriesLeft.length; i++) {
            yield Category.updateOne({ _id: categoriesLeft[i]._id }, { position: i + 1 });
        }
        return res.status(200).json({
            message: "Xóa thành công!",
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Xóa thất bại",
        });
    }
});
module.exports.create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let _a = req.body, { position, title } = _a, newCategoryData = __rest(_a, ["position", "title"]);
        const slug = slugify(title, { lower: true, strict: true, locale: "vi" });
        const maxCategory = yield Category.findOne({
            deleted: false,
        }).sort({ position: -1 });
        const maxPosition = maxCategory ? maxCategory.position : 0;
        if (!position) {
            position = maxPosition + 1;
        }
        else {
            yield maxCategory.updateMany({ position: { $gte: position } }, { $inc: { position: 1 } });
        }
        const newCategory = new Category(Object.assign(Object.assign({}, newCategoryData), { position,
            slug,
            title }));
        yield newCategory.save();
        return res.status(200).json({
            message: "Tạo mới sản phẩm thành công!",
            newCategory: newCategory,
        });
    }
    catch (error) {
        return res.status(400).json({
            error: error,
            message: "Tạo mới sản phẩm thất bại",
        });
    }
});
module.exports.getBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const category = yield Category.findOne({ slug: slug, deleted: false });
        if (!category) {
            return res.status(404).json({ message: "Không tìm thấy thể loại!" });
        }
        return res.status(200).json({
            message: "Lấy thông tin thể loại thành công!",
            category: category,
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Lỗi khi lấy thông tin thể loại!",
        });
    }
});
module.exports.edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slug = req.params.slug;
        const category = yield Category.findOne({ slug, deleted: false });
        if (!category) {
            return res.status(404).json({ message: "Không tìm thấy thể loại!" });
        }
        const oldPos = category.position;
        const newPos = Number(req.body.position);
        if (newPos && newPos !== oldPos) {
            if (oldPos < newPos) {
                yield Category.updateMany({ position: { $gt: oldPos, $lte: newPos }, deleted: false }, { $inc: { position: -1 } });
            }
            else {
                yield Category.updateMany({ position: { $gte: newPos, $lt: oldPos }, deleted: false }, { $inc: { position: 1 } });
            }
        }
        let updateData = Object.assign({}, req.body);
        if (req.body.title) {
            updateData.slug = slugify(req.body.title, {
                lower: true,
                strict: true,
                locale: "vi",
            });
        }
        yield Category.updateOne({ _id: category._id }, updateData);
        return res.status(200).json({
            message: "Cập nhật thông tin thành công!",
        });
    }
    catch (error) {
        return res.status(400).json({
            message: "Cập nhật thông tin thất bại",
        });
    }
});
