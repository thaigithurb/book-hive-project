const bookRoutes = require("./book.route");
module.exports = (app) => {
    const version = "/api/v1";
    app.use(version + "/books", bookRoutes);
};
