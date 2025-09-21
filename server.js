import express from "express";
const app = express();

import authRoutes from "./src/routes/auth.js";

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use("/api", authRoutes);

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
