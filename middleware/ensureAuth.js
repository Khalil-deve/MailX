const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next(); // User is logged in, proceed
    }
    req.flash("error", "You must be logged in to access this page.");
    res.redirect("/home"); // Redirect to login page if not authenticated
};

module.exports = ensureAuthenticated;