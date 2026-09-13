import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "path";
import authRoutes from "./routes/auth.routes";
import restaurantRoutes from "./routes/restaurants.routes";
import reviewRoutes from "./routes/reviews.routes";
import uploadRoutes from "./routes/upload.routes";

export function createApp() {
  const app = express();

  app.use(
    helmet({
      // This API serves no HTML of its own, and cover/review photos are fetched
      // cross-origin by the Vercel frontend (uploadImage() builds an absolute URL to this
      // server) — helmet's default same-origin resource policy and CSP are built for
      // HTML-serving apps and would silently break those image loads.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  // Vercel gives every deployment its own unique URL (per-branch, per-preview, plus the
  // project's default alias) on top of whatever custom domain is configured — a single
  // fixed CORS_ORIGIN breaks the moment traffic lands on any URL besides the one it names.
  // Allow the configured origin(s) (comma-separated) plus any *.vercel.app URL under this
  // project so every Vercel-issued domain works without an env var update per deploy.
  const allowedOrigins = (process.env.CORS_ORIGIN ?? "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const vercelProjectPattern = /^https:\/\/frontend-[a-z0-9-]*\.vercel\.app$/;

  app.use(
    cors({
      origin(origin, callback) {
        if (
          !origin ||
          allowedOrigins.includes("*") ||
          allowedOrigins.includes(origin) ||
          vercelProjectPattern.test(origin)
        ) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
    }),
  );
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
