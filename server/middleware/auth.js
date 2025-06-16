function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    res.redirect('/auth/login');
}

function isClient(req, res, next) {
    if (req.session.user && req.session.user.role === 'client') return next();
    res.status(403).send('Доступ только для клиентов');
}

function isMaster(req, res, next) {
    if (req.session.user && req.session.user.role === 'master') return next();
    res.status(403).send('Доступ только для мастеров');
}

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') return next();
    res.status(403).send('Доступ только для администраторов');
}

module.exports = { isAuthenticated, isClient, isMaster, isAdmin };