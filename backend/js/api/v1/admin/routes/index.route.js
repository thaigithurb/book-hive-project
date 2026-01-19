const bookRoutes = require("./book.route");
const categoryRoutes = require("./category.route");
const roleRoutes = require("./role.route");
const permissionRoutes = require("./permission.route");
const accountRoutes = require("./account.route");
const authRoutes = require("./auth.route");
const { adminAuth } = require("../../../../middleware/auth.middleware");
const { checkPermission } = require("../../../../middleware/permission.middleware");
module.exports = (app) => {
    const version = "/api/v1";
    const prefixAdmin = "/admin";
    app.use(version + prefixAdmin + "/books", adminAuth, checkPermission("view_books"), bookRoutes);
    app.use(version + prefixAdmin + "/categories", adminAuth, categoryRoutes);
    app.use(version + prefixAdmin + "/roles", adminAuth, roleRoutes);
    app.use(version + prefixAdmin + "/accounts", adminAuth, accountRoutes);
    app.use(version + prefixAdmin + "/auth", authRoutes);
};
