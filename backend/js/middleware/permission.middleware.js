module.exports.checkPermission = (permission) => (req, res, next) => {
    var _a, _b;
    if (!((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.permissions) === null || _b === void 0 ? void 0 : _b.includes(permission))) {
        return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này" });
    }
    next();
};
