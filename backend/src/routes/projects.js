const { Router } = require("express");
const { generate } = require("../utils/apiKey");
const projectService = require("../services/project.service");

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Project name is required" });
    }

    const { apiKey, hash, prefix } = generate();

    const project = await projectService.create({
      name: name.trim(),
      apiKey,
    });

    res.status(201).json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        api_key: apiKey,
        created_at: project.created_at,
      },
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const projects = await projectService.list();
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error("List projects error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await projectService.remove(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
