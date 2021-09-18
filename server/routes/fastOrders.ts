import express from "express";

import authenticate from "middleware/authentication";
import controller from "controllers/fastOrders";

const router = express.Router();

router.get("/", authenticate, controller.getFastOrders);
router.post("/", controller.createFastOrder);

export default router;
