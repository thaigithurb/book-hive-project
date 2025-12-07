// @ts-ignore
const bookRoutes = require("./book.route");
const categoryRoutes = require("./category.route");

module.exports = (app) => {
    const version = "/api/v1";
    const prefixAdmin = "/admin";

    app.use(version + prefixAdmin + "/books", bookRoutes);

    app.use(version + prefixAdmin + "/categories", categoryRoutes);
};