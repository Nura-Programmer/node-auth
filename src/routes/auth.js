import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";

const router = express.Router();
const users = [];

const registerValidators = [
  body("username")
    .isLength({ min: 3 })
    .withMessage("username must be at least 3 chars"),
  body("email").isEmail().withMessage("valid email required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 chars"),
];

router.post("/register", registerValidators, async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

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
    const hashed = await bcrypt.hash(password, 10);

    // Store user
    const user = { id: users.length + 1, username, email, password: hashed };

    return res.status(201).json({ message: "User registered", user });
  } catch (err) {
    next(err);
  }
});

export default router;
