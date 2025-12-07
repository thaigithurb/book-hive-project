const express = require('express');
require("dotenv").config();
const cors = require('cors');

const database = require("./config/database");
const clientRoutesApiVer1 = require("./api/v1/client/routes/index.route");
const adminRoutesApiVer1 = require("./api/v1/admin/routes/index.route");
const bodyParser = require('body-parser');

database.connect();

const app = express();
const port = process.env.PORT;

app.use(cors());

// parse application/json
app.use(bodyParser.json());

// Routes Version 1
clientRoutesApiVer1(app);
adminRoutesApiVer1(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});