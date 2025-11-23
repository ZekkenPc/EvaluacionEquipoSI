require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const voteRoutes = require("./routes/voteRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("public"));

connectDB();

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/votes", voteRoutes);

app.get("/", (req, res) => {
  res.send("API Votación Académica funcionando");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
