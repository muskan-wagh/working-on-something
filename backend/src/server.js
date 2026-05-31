const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { createLog } = require("./services/log.service");
const { requireApiKey } = require("./middleware/auth");
const { processLog } = require("./engine/detection");
const projectsRouter = require("./routes/projects");
const incidentsRouter = require("./routes/incidents");
const logsRouter = require("./routes/logs");
const aiRouter = require("./routes/ai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/projects", projectsRouter);
app.use("/api/incidents", incidentsRouter);
app.use("/api/logs", logsRouter);
app.use("/api/ai", aiRouter);

app.post("/api/logs", requireApiKey, async (req, res) => {
  try {
    const log = {
      endpoint: req.body.endpoint,
      method: req.body.method,
      status_code: String(req.body.status_code),
      latency_ms: String(req.body.latency_ms),
      error_message: req.body.error_message || null,
      stack_trace: req.body.stack_trace || null,
      project_id: req.project.id,
    };

    const savedLog = await createLog(log);

    // Fire-and-forget: run incident detection without blocking response
    const logRecord = Array.isArray(savedLog) ? savedLog[0] : savedLog;
    if (logRecord && (parseInt(log.status_code) >= 400 || log.error_message)) {
      processLog(logRecord).catch((err) =>
        console.error("Detection engine error:", err.message)
      );
    }

    res.status(201).json({
      success: true,
      data: savedLog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
