import express from "express";

import authenticate from "middleware/authentication";
import controller from "controllers/orders";

const router = express.Router();

router.get("/", authenticate, controller.getAll);
router.get("/:userId", authenticate, controller.getOrdersByUser);
router.post("/", authenticate, controller.create);
router.patch("/", authenticate, controller.update);
router.delete("/", authenticate, controller.delete);

export default router;
