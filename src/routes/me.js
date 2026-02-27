import express from "express";
import prisma from "../prisma.js";
import authRequired from "../middleware/authRequired.js";

const router = express.Router();

router.get("/me", authRequired, async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user.id);

    if (!userId) {
      return res.status(500).json({ error: "authRequired did not set userId" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        entitlements: true, // ✅ ADD THIS
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error("GET /me error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;