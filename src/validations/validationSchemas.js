import { body } from "express-validator";

export const registerValidators = [
  body("username")
    .isLength({ min: 3 })
    .withMessage("username must be at least 3 chars"),
  body("email").isEmail().withMessage("valid email required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 chars"),
];

export const loginValidators = [
  body("username").notEmpty().withMessage("username required"),
  body("password").notEmpty().withMessage("password required"),
];

export const forgotPasswordValidators = [
  body("email").isEmail().withMessage("valid email required"),
];

export const resetPasswordValidators = [
  body("token").notEmpty().withMessage("token required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("newPassword must be at least 8 chars"),
];
