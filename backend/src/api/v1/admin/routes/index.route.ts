// @ts-ignore
const bookRoutes = require("./book.route");
const categoryRoutes = require("./category.route");
const roleRoutes = require("./role.route");
const permissionRoutes = require("./permission.route");
const accountRoutes = require("./account.route");
const authRoutes = require("./auth.route");

module.exports = (app) => {
    const version = "/api/v1";
    const prefixAdmin = "/admin";

    app.use(version + prefixAdmin + "/books", bookRoutes);

    app.use(version + prefixAdmin + "/categories", categoryRoutes);

    app.use(version + prefixAdmin + "/roles", roleRoutes);

    app.use(version + prefixAdmin + "/accounts", accountRoutes);

    app.use(version + prefixAdmin + "/auth", authRoutes);
};