const bookRoutes = require("./book.route");
const orderRoutes = require("./order.route");
const paymentRoutes = require("./payment.route");
const authRoutes = require("./auth.route");
const cartRoutes = require("./cart.route");
const userRoutes = require("./user.route");
const rentalRoutes = require("./rental.route");
const favoriteRoutes = require("./favorite.route");
const reviewRoutes = require("./review.route");
const { clientAuth } = require("../../../../middleware/auth.middleware");

module.exports = (app) => {
    const version = "/api/v1";

    app.use(version + "/books" , bookRoutes);

    app.use(version + "/orders", orderRoutes);

    app.use(version + "/rentals", rentalRoutes);

    app.use(version + "/payment", paymentRoutes);

    app.use(version + "/cart", clientAuth, cartRoutes);

    app.use(version + "/auth", authRoutes);

    app.use(version + "/users", userRoutes);

    app.use(version + "/favorites", clientAuth, favoriteRoutes);

    app.use(version + "/reviews", clientAuth, reviewRoutes);
}

export {};