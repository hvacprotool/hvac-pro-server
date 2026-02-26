import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

const router = express.Router();

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (String(password).length < 8) {
      return res.status(400).json({ error: "password must be at least 8 characters" });
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      return res.status(409).json({ error: "email already registered" });
    }

    const hash = await bcrypt.hash(String(password), 10);

    const user = await prisma.user.create({
      data: { email: normalizedEmail, password: hash },
      select: { id: true, email: true },
    });

    const token = signToken(user);
    return res.json({ token, user });
  } catch (err) {
    console.error("register error", err);
    return res.status(500).json({ error: "register failed" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const token = signToken({ id: user.id, email: user.email });
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ error: "login failed" });
  }
});

export default router;