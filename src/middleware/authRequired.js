import jwt from "jsonwebtoken";

export default function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Server misconfigured: JWT_SECRET missing" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const userId = payload.userId || payload.id || payload.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.userId = userId;
    req.user = { id: userId, email: payload.email };

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}