const { check, validationResult } = require("express-validator");

// Middleware for Login Validation
const validateLogin = [
    check("email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("Please enter a valid email address."), // Validate Email

    check("password")
        .notEmpty()
        .withMessage("Password is required."), // Validate Password

    (req, res, next) => {
        const errors = validationResult(req); // Check for validation errors
        if (!errors.isEmpty()) {
            req.flash("error", errors.array().map(err => err.msg).join(" "));
            return res.redirect("/users/login");
        }
        next(); // Proceed to the next middleware if validation passes
    }
];

module.exports = validateLogin; // Export the validation middleware