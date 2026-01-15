const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const database = require("./config/database");
const clientRoutesApiVer1 = require("./api/v1/client/routes/index.route");
const adminRoutesApiVer1 = require("./api/v1/admin/routes/index.route");
const bodyParser = require("body-parser");
database.connect();
const app = express();
const port = process.env.PORT;
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        /\.onrender\.com$/,
        /\.payos\.vn$/,
        "*",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());
app.use(bodyParser.json());
clientRoutesApiVer1(app);
adminRoutesApiVer1(app);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
