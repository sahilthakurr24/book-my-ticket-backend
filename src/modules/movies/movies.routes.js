import express from "express";
import { createMovieController, listMoviesController } from "./movies.controller.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { isAdmin } from "../../common/middleware/isAdmin.js";

const router = express.Router();

router.get("/", listMoviesController);
router.post("/", authenticate, isAdmin, createMovieController);

export default router;
