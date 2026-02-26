module.exports = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'שגיאת שרת';
    res.status(status);
    res.render('error', { message });
};