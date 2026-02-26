import jwt from "jsonwebtoken";

export default function authRequired(req, res, next) {
  try {
    console.log("AUTH MIDDLEWARE HIT:", req.method, req.path);
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Server misconfigured: JWT_SECRET missing" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, email: payload.email };

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}