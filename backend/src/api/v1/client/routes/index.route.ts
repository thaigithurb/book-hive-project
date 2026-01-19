const bookRoutes = require("./book.route");
const orderRoutes = require("./order.route");
const paymentRoutes = require("./payment.route");
const authRoutes = require("./auth.route");

module.exports = (app) => {
    const version = "/api/v1";

    app.use(version + "/books" , bookRoutes);

    app.use(version + "/orders", orderRoutes);

    app.use(version + "/payment", paymentRoutes);

    app.use(version + "/auth", authRoutes);
}

export {};