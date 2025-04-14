const saveRedirectUrl = (req, res, next) => {
    if (req.session.RedirectUrl) {
        res.locals.RedirectUrl = req.session.RedirectUrl;
        console.log(res.locals.RedirectUrl);
    }
    next();
}

module.exports = saveRedirectUrl;