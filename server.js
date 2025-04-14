//in the development phase they are used.
if(process.env.NODE_ENV != "production"){
  require('dotenv').config()   
}

// ==========================
// Import Dependencies
// ==========================
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");

// ==========================
// Import Local Files
// ==========================
const User = require("./model/users.js");
const usersRoutes = require("./routes/users.js");
const emailRoutes = require("./routes/email.js");
// const { saveRedirectUrl } = require("./middleware.js");
const ExpressError = require("./utlilty/ExpressError");

// ==========================
// App Configuration
// ==========================
const port = 3000;
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", true); // Enables proper IP detection behind proxies

// ==========================
// Middleware Setup
// ==========================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(cors());

// ==========================
// MongoDB Connection
// ==========================
const URL = process.env.DATABASE_URL || "mongodb://localhost:27017/TempMail";

async function main() {
  try {
    await mongoose.connect(URL);
    console.log("MongoDB connection successful!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
main();

// ==========================
// Session & Flash Setup
// ==========================
const sessionOption = {
  secret: "FirstProject",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1 * 24 * 60 * 60 * 1000,
    maxAge: 1 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
};

app.use(session(sessionOption));
app.use(flash());

// ==========================
// Passport Configuration
// ==========================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==========================
// Global Middleware (locals)
// ==========================
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  console.log("Current User:", req.user);
  next();
});

// ==========================
// Routes
// ==========================
app.use("/users", usersRoutes);      // User Auth Routes
app.use(emailRoutes);      // Email Generator Routes

app.get("/", (req, res) => {
  console.log("Hello world");
  res.render("listing/index.ejs");
});


// ==========================
//  // Pass the error to the next middleware (for 404) 
// ==========================
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found!", 404));
});

// ==========================
// Error Handler
// ==========================
app.use((err, req, res, next) => {
  console.log("Error handler called");
  const { status = 500, message = "Something went wrong" } = err;
  res.render("listing/error.ejs", { status, message });
});


// ==========================
// Start Server
// ==========================
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
