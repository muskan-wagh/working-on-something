const incidentService = require("../services/incident.service");

const COLUMN_MISSING_CODES = ["42703"];

function isSetupError(error) {
  return error && (
    COLUMN_MISSING_CODES.includes(error.code) ||
    error.message?.includes("does not exist") ||
    error.message?.includes("Could not find")
  );
}

function fingerprint(errorMessage) {
  if (!errorMessage) return "no_error";
  return errorMessage
    .toLowerCase()
    .replace(/\b(the|a|an|in|on|at|to|for|of|with|from|by)\b/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function determineSeverity(statusCode) {
  const code = parseInt(statusCode);
  if (code >= 500) return "critical";
  if (code === 429 || code === 401 || code === 403) return "high";
  if (code >= 400) return "medium";
  return "low";
}

function buildTitle(log) {
  const parts = [log.status_code, log.method, log.endpoint].filter(Boolean);
  if (log.error_message) {
    const msg = log.error_message.slice(0, 60);
    parts.push(`— ${msg}`);
  }
  return parts.join(" ");
}

async function processLog(log) {
  const code = parseInt(log.status_code);
  const isError = code >= 400 || log.error_message;
  if (!isError) return null;

  const logWithFingerprint = {
    ...log,
    error_fingerprint: fingerprint(log.error_message),
  };

  try {
    const existing = await incidentService.findOpenMatching(logWithFingerprint);
    if (existing) {
      return await incidentService.incrementOccurrence(existing.id);
    }

    const created = await incidentService.create({
      title: buildTitle(log),
      severity: determineSeverity(log.status_code),
      status: "open",
      projectId: log.project_id,
      endpoint: log.endpoint,
      method: log.method,
      statusCode: log.status_code,
      errorFingerprint: logWithFingerprint.error_fingerprint,
    });
    return created;
  } catch (error) {
    if (!isSetupError(error)) {
      console.error("Detection engine error:", error.message);
    }
    return null;
  }
}

module.exports = { processLog, fingerprint, determineSeverity };
