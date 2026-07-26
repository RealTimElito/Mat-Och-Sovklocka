import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import { requireAuth, signToken } from "../auth.js";

const router = Router();

router.post("/signup", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return res.status(409).json({ error: "Username already exists" });
  }

  const passwordHash = bcrypt.hashSync(String(password), 10);
  const user = await prisma.user.create({
    data: {
      username: String(username),
      passwordHash,
    },
  });

  return res.json({
    token: signToken(user),
    user: { id: user.id, username: user.username },
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const user = await prisma.user.findUnique({ where: { username: String(username) } });
  if (!user || !bcrypt.compareSync(String(password), user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  return res.json({
    token: signToken(user),
    user: { id: user.id, username: user.username },
  });
});

router.get("/me", requireAuth, async (req, res) => {
  // JWT payload contains id/username.
  return res.json({
    id: req.user.id,
    username: req.user.username,
  });
});

export default router;

