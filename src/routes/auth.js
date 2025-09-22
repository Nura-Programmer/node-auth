import express from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  forgotPasswordValidators,
  loginValidators,
  registerValidators,
  resetPasswordValidators,
} from "../validations/validationSchemas.js";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret_key";

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
        return res.status(403).json({ message: "Email already in use" });
      return res.status(403).json({ message: "Username already in use" });
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

router.post("/login", loginValidators, async (req, res, next) => {
  try {
    // validation
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

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

router.post(
  "/forgot-password",
  forgotPasswordValidators,
  async (req, res, next) => {
    try {
      // validation
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { email } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // generate token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 mins expiry

      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      });

      // TODO: send token via email, for now return it
      res.status(200).json({ message: "Reset token generated", token });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/reset-password",
  resetPasswordValidators,
  async (req, res, next) => {
    try {
      // validation
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { token, newPassword } = req.body;

      const reset = await prisma.passwordResetToken.findUnique({
        where: { token },
      });
      if (!reset || reset.expiresAt < new Date()) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const hashed = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: reset.userId },
        data: { password: hashed },
      });

      // delete token so it can't be reused
      await prisma.passwordResetToken.delete({ where: { id: reset.id } });

      res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
