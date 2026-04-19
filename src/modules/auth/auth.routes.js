import express from "express";
import {
  signupController,
  signinController,
  refreshTokenController,
  logoutController,
} from "./auth.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { upload } from "../../common/middleware/multer.js";

const router = express.Router();

router.post("/sign-up", upload.single("avatar"), signupController);
router.post("/sign-in", signinController);
router.post("/refresh-token", refreshTokenController);
router.post("/logout", authenticate, logoutController);


export default router;
