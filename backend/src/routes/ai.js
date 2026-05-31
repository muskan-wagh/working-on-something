const { Router } = require("express");
const aiService = require("../services/ai.service");

const router = Router();

router.get("/summary", async (req, res) => {
  try {
    const analyses = await aiService.getLatestAnalyses();
    res.json({ success: true, data: analyses });
  } catch (error) {
    console.error("AI summary error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
