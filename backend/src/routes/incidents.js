const { Router } = require("express");
const incidentService = require("../services/incident.service");
const aiService = require("../services/ai.service");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const projectId = req.query.project_id;
    const incidents = await incidentService.list(projectId);
    res.json({ success: true, data: incidents });
  } catch (error) {
    console.error("List incidents error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { status, severity } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (severity) updates.severity = severity;

    const incident = await incidentService.update(req.params.id, updates);
    res.json({ success: true, data: incident });
  } catch (error) {
    console.error("Update incident error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id/analysis", async (req, res) => {
  try {
    const incident = await incidentService.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    const analysis = await aiService.getOrCreateAnalysis(incident);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error("Incident analysis error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
