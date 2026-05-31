const axios = require("axios");

async function sendLogs(logData, options) {
  try {
    const response = await axios.post(
      `${options.serverUrl}/api/logs`,
      logData,
      {
        headers: {
          "x-api-key": options.apiKey,
          "Content-Type": "application/json",
        },
      },
    );
    console.log("[API guardian] Log Send");
  } catch (error) {
    console.error("[API guardian] failed: ", error.message);
  }
}

module.exports = sendLogs;
