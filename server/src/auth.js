import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "change-me";

export const signToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username },
    SECRET,
    { expiresIn: "8h" },
  );

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

