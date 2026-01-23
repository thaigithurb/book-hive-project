const Cart = require("../../models/cart.model");

// [GET] /api/v1/cart
module.exports.index = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.json({ items: [], total: 0 });
    }

    const total = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      items: cart.items,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: "Lấy cart thất bại" });
  }
};

// [POST] /api/v1/cart/add-item
module.exports.add = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, quantity, title, price, image, slug } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existing = cart.items.find((item) => item.bookId.toString() === bookId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        bookId,
        quantity,
        title,
        price,
        image,
        slug,
      });
    }

    await cart.save();
    res.json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ error: "Thêm vào cart thất bại" });
  }
};

// [PATCH] /api/v1/cart/edit/:id 
module.exports.editItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart không tồn tại" });

    const item = cart.items.find((item) => item.bookId.toString() === id);
    if (!item) return res.status(404).json({ error: "Item không tồn tại" });

    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.bookId.toString() !== id);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ error: "Cập nhật cart thất bại" });
  }
};

// [DELETE] /api/v1/cart/delete/:id
module.exports.deleteItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart không tồn tại" });

    cart.items = cart.items.filter((item) => item.bookId.toString() !== id);

    await cart.save();
    res.json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ error: "Xóa sản phẩm thất bại" });
  }
};

// [DELETE] /api/v1/cart/delete-all
module.exports.clear = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart không tồn tại" });

    cart.items = [];
    await cart.save();
    res.json({ items: [] });
  } catch (error) {
    res.status(500).json({ error: "Xóa toàn bộ cart thất bại" });
  }
};

// [POST] /api/v1/cart/add-rental
module.exports.addRental = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, quantity, title, price, image, slug, rentalType, rentalDays } = req.body;

    if (!rentalType || !rentalDays) {
      return res.status(400).json({ error: "Chọn loại thuê (ngày/tuần) và số lượng" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existing = cart.items.find(
      (item) =>
        item.bookId.toString() === bookId &&
        item.type === "rent" &&
        item.rentalType === rentalType &&
        item.rentalDays === rentalDays
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        bookId,
        quantity,
        title,
        price,
        image,
        slug,
        type: "rent",
        rentalType,
        rentalDays,
      });
    }

    await cart.save();
    res.json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ error: "Thêm rental vào cart thất bại" });
  }
};

export {};