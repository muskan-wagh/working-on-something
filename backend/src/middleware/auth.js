const { findByPlaintextKey } = require("../services/project.service");

async function requireApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ success: false, message: "API key is required" });
  }

  const project = await findByPlaintextKey(apiKey);
  if (!project) {
    return res.status(401).json({ success: false, message: "Invalid API key" });
  }

  req.project = { id: project.id, name: project.name };
  next();
}

module.exports = { requireApiKey };
