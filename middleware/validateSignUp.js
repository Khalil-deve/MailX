const { check, validationResult } = require("express-validator");

// Middleware for Signup Validation & Sanitization
const validateSignUp = [
    check("FirstName")
        .trim()
        .escape()
        .isString()
        .notEmpty()
        .withMessage("First Name is required and must be a string."), // Validate First Name

    check("LastName")
        .trim()
        .escape()
        .isString()
        .notEmpty()
        .withMessage("Last Name is required and must be a string."), // Validate Last Name

    check("email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("Please enter a valid email address."), // Validate Email

    check("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long.")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter.")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter.")
        .matches(/\d/)
        .withMessage("Password must contain at least one number.")
        .matches(/[\W]/)
        .withMessage("Password must contain at least one special character."), // Validate Password

    (req, res, next) => {
        const errors = validationResult(req); // Check for validation errors
        if (!errors.isEmpty()) {
            req.flash("error", errors.array().map(err => err.msg).join(" "));
            return res.redirect("/");
        }
        next(); // Proceed to the next middleware if validation passes
    }
];

module.exports = validateSignUp; // Export the validation middleware