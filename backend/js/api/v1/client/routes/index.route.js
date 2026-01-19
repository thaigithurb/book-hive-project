"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bookRoutes = require("./book.route");
const orderRoutes = require("./order.route");
const paymentRoutes = require("./payment.route");
const authRoutes = require("./auth.route");
const { clientAuth } = require("../../../../middleware/auth.middleware");
module.exports = (app) => {
    const version = "/api/v1";
    app.use(version + "/books", clientAuth, bookRoutes);
    app.use(version + "/orders", clientAuth, orderRoutes);
    app.use(version + "/payment", clientAuth, paymentRoutes);
    app.use(version + "/auth", authRoutes);
};
