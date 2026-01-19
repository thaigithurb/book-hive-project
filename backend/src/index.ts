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

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "https://book-hive-project-1.onrender.com",
      ];
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(cookieParser());

// parse application/json
app.use(bodyParser.json());

// Routes Version 1
clientRoutesApiVer1(app);
adminRoutesApiVer1(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
