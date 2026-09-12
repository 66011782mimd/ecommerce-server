const path = require("path");

// โหลด .env จากโฟลเดอร์เดียวกับ server.js
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { readdirSync } = require("fs");

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));
app.use(cors());

// เช็กว่า Stripe key ถูกโหลดหรือยัง
console.log(
  "Stripe key loaded:",
  Boolean(process.env.STRIPE_SECRET_KEY)
);

// โหลด routes จากโฟลเดอร์เดียวกับ server.js
const routesPath = path.join(__dirname, "routes");

readdirSync(routesPath)
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    console.log("Load route:", file);

    app.use(
      "/api",
      require(path.join(routesPath, file))
    );
  });

// Start Server
app.listen(5001, () => {
  console.log("Server is running on port 5001");
});