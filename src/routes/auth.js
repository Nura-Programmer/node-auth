import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret_key";

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
    // check existing username/email
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      if (existing.email === email)
        return res.status(409).json({ message: "Email already in use" });
      return res.status(409).json({ message: "Username already in use" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Store user
    const user = await prisma.user.create({
      data: { username, email, password: hashed },
      omit: { password },
    });

    return res.status(201).json({ message: "User registered", user });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    // validation

    const { username, password } = req.body;

    // Find user by username
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Compare passwords
    const isCorrestPassword = await bcrypt.compare(password, user.password);
    if (!isCorrestPassword)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
