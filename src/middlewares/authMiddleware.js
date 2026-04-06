import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "segredo";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token nao fornecido" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (!scheme || !token || !/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: "Token mal formatado" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    req.userId = decoded.id;
    req.userEmail = decoded.email;

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalido" });
  }
}

export default authMiddleware;
