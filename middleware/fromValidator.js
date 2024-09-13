import { check } from "express-validator";

const formValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .escape()
    .trim(),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail()
    .escape()
    .trim(),
  check("message")
    .notEmpty()
    .escape()
    .withMessage("Message is required")
    .isString()
    .withMessage("Message must be a string")
    .trim(),
];

export default formValidator;
