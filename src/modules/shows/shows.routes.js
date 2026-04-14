import express from "express";
import {
  createShowController,
  listShowsByMovieController,
  listSeatsByShowController,
} from "./shows.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { isAdmin } from "../../common/middleware/isAdmin.js";

const router = express.Router();

router.post("/", authenticate, isAdmin, createShowController);
router.get("/:showId/seats", authenticate, listSeatsByShowController);

export default router;
