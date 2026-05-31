const { Router } = require("express");
const supabase = require("../config/supabase");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { project_id, limit: limitParam, offset } = req.query;
    const limit = Math.min(parseInt(limitParam) || 100, 500);

    let query = supabase
      .from("Logs_apiD")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset || 0, (offset || 0) + limit - 1);

    if (project_id) query = query.eq("project_id", project_id);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ success: true, data, total: count });
  } catch (error) {
    console.error("List logs error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
