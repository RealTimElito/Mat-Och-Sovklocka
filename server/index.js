import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.js";
import eventsRoutes from "./src/routes/events.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on :${port}`);
});

