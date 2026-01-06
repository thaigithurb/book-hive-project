const bookRoutes = require("./book.route");
const categoryRoutes = require("./category.route");
const roleRoutes = require("./role.route");
const permissionRoutes = require("./permission.route");
const accountRoutes = require("./account.route");
const authRoutes = require("./auth.route");
const authMiddleware = require("../../../../middleware/auth.middleware");
module.exports = (app) => {
    const version = "/api/v1";
    const prefixAdmin = "/admin";
    app.use(version + prefixAdmin + "/books", authMiddleware, bookRoutes);
    app.use(version + prefixAdmin + "/categories", authMiddleware, categoryRoutes);
    app.use(version + prefixAdmin + "/roles", authMiddleware, roleRoutes);
    app.use(version + prefixAdmin + "/accounts", authMiddleware, accountRoutes);
    app.use(version + prefixAdmin + "/auth", authRoutes);
};
