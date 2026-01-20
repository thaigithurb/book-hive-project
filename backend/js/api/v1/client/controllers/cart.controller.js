var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Cart = require("../../models/cart.model");
module.exports.index = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const cart = yield Cart.findOne({ userId });
        if (!cart) {
            return res.json({ items: [], total: 0 });
        }
        const total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        res.json({
            items: cart.items,
            total,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Lấy cart thất bại" });
    }
});
module.exports.add = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { bookId, quantity, title, price, image, slug } = req.body;
        let cart = yield Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }
        const existing = cart.items.find((item) => item.bookId.toString() === bookId);
        if (existing) {
            existing.quantity += quantity;
        }
        else {
            cart.items.push({
                bookId,
                quantity,
                title,
                price,
                image,
                slug,
            });
        }
        yield cart.save();
        res.json({ items: cart.items });
    }
    catch (error) {
        res.status(500).json({ error: "Thêm vào cart thất bại" });
    }
});
module.exports.editItem = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { quantity } = req.body;
        console.log(id);
        console.log(quantity);
        const cart = yield Cart.findOne({ userId });
        if (!cart)
            return res.status(404).json({ error: "Cart không tồn tại" });
        const item = cart.items.find((item) => item._id.toString() === id);
        if (!item)
            return res.status(404).json({ error: "Item không tồn tại" });
        if (quantity <= 0) {
            cart.items = cart.items.filter((item) => item._id.toString() !== id);
        }
        else {
            item.quantity = quantity;
        }
        yield cart.save();
        res.json({ items: cart.items });
    }
    catch (error) {
        res.status(500).json({ error: "Cập nhật cart thất bại" });
    }
});
module.exports.deleteItem = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const cart = yield Cart.findOne({ userId });
        if (!cart)
            return res.status(404).json({ error: "Cart không tồn tại" });
        cart.items = cart.items.filter((item) => item._id.toString() !== id);
        yield cart.save();
        res.json({ items: cart.items });
    }
    catch (error) {
        res.status(500).json({ error: "Xóa item thất bại" });
    }
});
module.exports.clear = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const cart = yield Cart.findOne({ userId });
        if (!cart)
            return res.status(404).json({ error: "Cart không tồn tại" });
        cart.items = [];
        yield cart.save();
        res.json({ items: [] });
    }
    catch (error) {
        res.status(500).json({ error: "Xóa toàn bộ cart thất bại" });
    }
});
