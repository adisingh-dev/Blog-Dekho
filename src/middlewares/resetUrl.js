const resetUrl = (req, res, next) => {
    if (Object.keys(req.query).length > 0) {
        res.redirect('/blogs');
    }
    next();
};

export default resetUrl;