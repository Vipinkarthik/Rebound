function apiKeyAuth(req, res, next) {
  const adminKey = process.env.ADMIN_API_KEY || "secret-admin-key";
  const apiKeyHeader = req.headers["x-api-key"];

  if (!apiKeyHeader || apiKeyHeader !== adminKey) {
    return res.status(401).json({
      error: "Unauthorized: Missing or invalid x-api-key header for policy modification."
    });
  }

  next();
}

module.exports = apiKeyAuth;
