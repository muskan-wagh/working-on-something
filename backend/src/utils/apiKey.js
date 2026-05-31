const crypto = require("crypto");

const KEY_PREFIX = "apg_";
const KEY_BYTES = 32;

function generate() {
  const raw = crypto.randomBytes(KEY_BYTES).toString("hex");
  const apiKey = `${KEY_PREFIX}${raw}`;
  const hash = hashKey(apiKey);
  const prefix = apiKey.slice(0, 8);
  return { apiKey, hash, prefix };
}

function hashKey(apiKey) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

module.exports = { generate, hashKey };
