import express from "express";
const router = express.Router();

const users = [];

router.post("/register", (req, res, next) => {
  try {
    // Validate request

    const { username, email, password } = req.body;

    // check existing username/email
    const existing = users.find(
      (user) => user.username === username || user.email === email
    );

    if (existing) {
      if (existing.email === email)
        return res.status(409).json({ message: "Email already in use" });
      return res.status(409).json({ message: "Username already in use" });
    }

    // Hash password

    // Store user
    const user = { id: users.length + 1, username, email, password };

    return res.status(201).json({ message: "User registered", user });
  } catch (err) {
    next(err);
  }
});

export default router;
