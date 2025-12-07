var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Category = require("../../models/category.model");
const slugify = require("slugify");
module.exports.index = (req, res) => __awaiter(this, void 0, void 0, function* () {
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
        const categories = yield Category.find(find).skip(skip).limit(limit).sort(sort);
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
            message: "Không có sách nào",
        });
    }
    catch (error) {
        res.json("Không tìm thấy!");
    }
});
module.exports.changeStatus = (req, res) => __awaiter(this, void 0, void 0, function* () {
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
            return res.status(404).json({ message: "Không tìm thấy sách!" });
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
