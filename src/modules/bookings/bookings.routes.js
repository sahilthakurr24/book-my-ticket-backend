import express from "express";
import { createBookingController } from "./bookings.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";

const router = express.Router();

router.post("/", authenticate, createBookingController);

export default router;
