const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* -------------------- Middlewares -------------------- */
app.use(cors());
app.use(express.json());

/* -------------------- MongoDB Connection -------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* -------------------- Routes -------------------- */
app.get("/", (req, res) => {
  res.send("SkillSphere API running");
});

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const projectRoutes = require("./routes/projects");
app.use("/api/projects", projectRoutes);
const proposalRoutes = require("./routes/proposals");

app.use("/api/proposals", proposalRoutes);

/* -------------------- Server -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
