import prisma from "../prisma.js";

export default function requireEntitlement(entitlementName) {
  return async (req, res, next) => {
    try {
      const userId = req.userId || (req.user && req.user.id);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { entitlements: true },
      });

      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const entitlements = user.entitlements || [];
      if (!entitlements.includes(entitlementName)) {
        return res.status(403).json({
          error: "Forbidden",
          missingEntitlement: entitlementName,
        });
      }

      return next();
    } catch (err) {
      console.error("requireEntitlement error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  };
}