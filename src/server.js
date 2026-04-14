import "dotenv/config";
import { app } from "./app.js";


const PORT = process.env.PORT || 3000;
const start = async () => {
  //db connection
  // await connectDB();

  app.listen(PORT, () => {
    console.log(
      `Server is running at : http://localhost:${PORT} in ${process.env.NODE_ENV} mode`,
    );
  });
};

start().catch((err) => {
  console.error("Failed to start the server", err);
  process.exit(1);
});
