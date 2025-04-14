const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../model/users.js");
const crypto = require("crypto");
const sendEmail = require("../utlilty/sendEmail");

// Middleware to save redirect URL for authenticated routes
const saveRedirectUrl = require("../middleware/saveRedirecturl.js");
const { check, validationResult } = require("express-validator");
const sanitize = require("mongo-sanitize");

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

// Route to render the Signup page
router.get("/SignUp", (req, res) => {
    console.log("Welcome back");
    res.render("Authenication/sign.ejs");
});

// Signup Route (POST)
router.post("/SignUp", validateSignUp, async (req, res, next) => {
    try {
        console.log("Data Received: ", req.body);
        let { FirstName, LastName, email, password } = req.body;

        // Sanitize user input to prevent NoSQL injection
        FirstName = sanitize(FirstName);
        LastName = sanitize(LastName);
        email = sanitize(email);

        let username = `${FirstName} ${LastName}`;
        const existingUser = await User.findOne({ email }); // Check if the email is already registered
        if (existingUser) {
            req.flash("error", "This email is already registered!");
            return res.redirect("/users/SignUp");
        }

        // Generate a token for email verification
        const emailToken = crypto.randomBytes(32).toString("hex");
        const emailTokenExpire = Date.now() + 1000 * 60 * 30; // Token expires in 30 minutes

        // Create a new user and save it to the database
        let newUser = new User({ username, email, emailToken, emailTokenExpire });
        let RegisteredUser = await User.register(newUser, password);
        console.log("Registered User: ", RegisteredUser);

        // Send verification email
        const verificationLink = `http://localhost:3000/users/verify-email?token=${emailToken}`;
        const emailHTML = `
            <h2>Hello ${username},</h2>
            <p>Thank you for signing up on MailX!</p>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${verificationLink}">Verify Email</a>
            <br><br>
            <small>This link will expire in 30 minutes.</small>
        `;

        await sendEmail(email, "MailX - Verify Your Email", emailHTML);

        req.flash("success", "Check your inbox to verify your email before logging in.");
        return res.redirect("/");

    } catch (error) {
        console.log(error);
        req.flash("error", error.message);
        res.redirect("/users/SignUp");
    }
});

// Verify Email Route
router.get("/verify-email", async (req, res) => {
    const token = req.query.token; // Get the token from the query string
    const user = await User.findOne({
        emailToken: token,
        emailTokenExpire: { $gt: Date.now() } // Check if the token is valid and not expired
    });

    if (!user) {
        req.flash("error", "Invalid or expired token.");
        return res.redirect("/users/SignUp");
    }

    // Mark the user as verified and clear the token
    user.isVerified = true;
    user.emailToken = undefined;
    user.emailTokenExpire = undefined;
    await user.save();

    req.flash("success", "Email verified! You can now log in.");
    res.redirect("/users/Login");
});

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

// Login Route (GET)
router.get("/login", (req, res) => {
    res.render("Authenication/login.ejs"); // Render the login page
});

// Login Route (POST)
router.post("/login", validateLogin, saveRedirectUrl, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.error("Error:", err);
            return next(err);
        }
        if (!user || !user.isVerified) {
            console.log("User not found or not verified:", user);
            req.flash("error", "Please verify it before logging in.");
            return res.redirect("/users/login");
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error("Login error:", err);
                return next(err);
            }
            req.flash("success", "Welcome back!");
            res.redirect(res.locals.RedirectUrl || "/"); // Redirect to the saved URL or home page
        });
    })(req, res, next);
});

// Logout Route
router.get("/logout/:id", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You logged out!");
        res.redirect("/");
    });
});

// Global Error Handling Middleware
router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    req.flash("error", "Something went wrong!");
    res.redirect("/"); // Redirect to the home page
});

module.exports = router;
