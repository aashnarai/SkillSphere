const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

router.post("/create", async (req, res) => {
  try {

    const { title, description, budget, skills, clientId } = req.body;

    const project = new Project({
      title,
      description,
      budget,
      skills,
      clientId
    });

    await project.save();

    res.json({
      message: "Project created successfully",
      project
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;