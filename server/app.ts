import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import authRoutes from "routes/auth";
import userRoutes from "routes/user";
import ordersRoutes from "routes/orders";
import fastOrdersRoutes from "routes/fastOrders";

const corsOptions = {
  origin: process.env.CLIENT,
  credentials: true,
};
const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(morgan("dev"));
app.use(express.static(__dirname + "/uploads"));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/fast-orders", fastOrdersRoutes);
app.get("/api/google-map", function (req, res) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (key) {
    res.send(key);
  } else {
    res.sendStatus(404);
  }
});
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});
app.use(express.static(path.join(__dirname, "../client/build")));

module.exports = app;
