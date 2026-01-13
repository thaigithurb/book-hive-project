module.exports.checkPermission = (permission) => (req, res, next) => {
  if (!req.user?.permissions?.includes(permission)) {
    return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này" });
  }
  next();
};