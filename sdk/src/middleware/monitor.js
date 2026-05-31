const sendLogs = require("../client/sendLogs");

function monitor(options) {
  if (!options.apiKey) {
    throw new Error("apiKey is required");
  }

  if (!options.serverUrl) {
    throw new Error("serverUrl is required");
  }

  return (req, res, next) => {
    const startTime = Date.now();

    const originalJson = res.json.bind(res);
    let errorMessage = null;
    let stackTrace = null;

    res.json = function (body) {
      if (res.statusCode >= 400 && body) {
        errorMessage = typeof body === "string" ? body : body.message || body.error || JSON.stringify(body);
      }
      return originalJson(body);
    };

    res.on("finish", async () => {
      const latency = Date.now() - startTime;

      const logData = {
        endpoint: req.originalUrl,
        method: req.method,
        status_code: res.statusCode,
        latency_ms: latency,
        error_message: errorMessage,
        stack_trace: stackTrace,
      };

      await sendLogs(logData, options);
    });

    next();
  };
}

module.exports = monitor;
