module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.RedirectUrl) {
        res.locals.RedirectUrl = req.session.RedirectUrl;
        console.log(res.locals.RedirectUrl);
    }
    next();
}

module.exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next(); // User is logged in, proceed
    }
    req.flash("error", "You must be logged in to access this page.");
    res.redirect("/home"); // Redirect to login page if not authenticated
};