import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import moviesRouter from "./modules/movies/movies.routes.js";
import showsRouter from "./modules/shows/shows.routes.js";
import bookingsRouter from "./modules/bookings/bookings.routes.js";
import { listShowsByMovieController } from "./modules/shows/shows.controller.js";
import { errorHandler } from "./common/middleware/error-handler.js";
import ApiResponse from "./common/utils/api-response.js";
import { upload } from "./common/middleware/multer.js";
import { uploadImageToImageKit } from "./common/services/imagekit.service.js";
import cookieparser from "cookie-parser";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use("/auth", authRouter);
app.use("/movies", moviesRouter);
// GET /movies/:movieId/shows — listing shows for a movie
app.get("/movies/:movieId/shows", listShowsByMovieController);
app.use("/shows", showsRouter);
app.use("/bookings", bookingsRouter);

//uploading
app.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return ApiResponse.ok(res, "No file uploaded", null);
    }

    const uploadedFile = await uploadImageToImageKit(req.file, "/uploads");

    return ApiResponse.ok(res, "File uploaded", {
      file: {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      url: uploadedFile?.url ?? null,
      thumbnailUrl: uploadedFile?.thumbnailUrl ?? null,
      fileId: uploadedFile?.fileId ?? null,
    });
  } catch (err) {
    next(err);
  }
});

// Global error handler — must be last
app.use(errorHandler);
