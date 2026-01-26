var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Favorite = require("../../models/favorite.model");
module.exports.index = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
        const userId = req.user.userId;
        const favorites = yield Favorite.find({ userId })
            .skip(skip)
            .limit(limit)
            .populate("bookId");
        const total = yield Favorite.countDocuments({ userId });
        return res.status(200).json({ favorites, total, limit });
    }
    catch (error) {
        return res.status(500).json({ message: "Lỗi server", error });
    }
});
module.exports.addFavorite = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { bookId } = req.body;
        if (!bookId)
            return res.status(400).json({ message: "Không tìm thấy bookId" });
        const existed = yield Favorite.findOne({ userId, bookId });
        if (existed)
            return res.status(409).json({ message: "Đã thêm có trong yêu thích" });
        const favorite = new Favorite({ userId, bookId });
        yield favorite.save();
        return res.status(201).json({ favorite });
    }
    catch (error) {
        return res.status(500).json({ message: "Lỗi server", error });
    }
});
module.exports.removeFavorite = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { bookId } = req.body;
        if (!bookId)
            return res.status(400).json({ message: "Không tìm thấy bookId" });
        const deleted = yield Favorite.findOneAndDelete({ userId, bookId });
        if (!deleted)
            return res
                .status(404)
                .json({ message: "Không tìm thấy trong yêu thích" });
        return res.status(200).json({ message: "Đã xóa khỏi yêu thích" });
    }
    catch (error) {
        return res.status(500).json({ message: "Lỗi server", error });
    }
});
