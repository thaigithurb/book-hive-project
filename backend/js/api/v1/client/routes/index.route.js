"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const homeRoutes = require("./home.route");
const bookRoutes = require("./book.route");
module.exports = (app) => {
    const version = "/api/v1";
    app.use(version + "/home", homeRoutes);
    app.use(version + "/books", bookRoutes);
};
