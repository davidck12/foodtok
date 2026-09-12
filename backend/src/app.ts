import cors from "cors";
import express from "express";
import path from "path";
import authRoutes from "./routes/auth.routes";
import restaurantRoutes from "./routes/restaurants.routes";
import reviewRoutes from "./routes/reviews.routes";
import uploadRoutes from "./routes/upload.routes";

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/restaurants", restaurantRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/upload", uploadRoutes);

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal server error" });
  });

  return app;
}
