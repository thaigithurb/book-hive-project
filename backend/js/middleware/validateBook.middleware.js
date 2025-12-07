module.exports = (req, res, next) => {
    const { title, author, category } = req.body;
    const errors = [];
    if (!title || typeof title !== "string" || title.trim().length < 3) {
        return res.status(400).json({ message: "Tên sách phải có ít nhất 3 ký tự!" });
    }
    if (!author || typeof author !== "string" || author.trim().length < 3) {
        return res.status(400).json({ message: "Tác giả phải có ít nhất 3 ký tự!" });
    }
    if (!category || typeof category !== "string" || category.trim().length < 3) {
        return res.status(400).json({ message: "Thể loại phải có ít nhất 3 ký tự!" });
    }
    if (errors.length > 0) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ!", errors });
    }
    next();
};
