import express from "express";

import authenticate from "middleware/authentication";
import upload from "middleware/upload";
import {
  create,
  update,
  initPasswordReset,
  confirmPasswordReset,
  isEmailUsed,
} from "controllers/user";

const router = express.Router();

router.post("/", create);
router.put("/", authenticate, upload.single("avatar"), update);
router.post("/passReset", initPasswordReset);
router.put("/passReset", confirmPasswordReset);
router.post("/isEmailUsed", isEmailUsed);

export default router;
