const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const i18n = require('i18n');
const { sequelize, User, Service, Order, Settings, Payment } = require('./models');
const socketIo = require('socket.io');
const http = require('http');
const dotenv = require('dotenv');
const winston = require('winston');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Логирование
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'server/logs/app.log' }),
        new winston.transports.Console()
    ]
});

logger.info('Starting server', { timestamp: new Date().toISOString() });

// i18n
i18n.configure({
    locales: ['ru', 'en'],
    directory: path.join(__dirname, 'locales'),
    defaultLocale: 'ru',
    objectNotation: 'lang',
    queryParameter: 'lang',
});

app.use(express.static(path.join(__dirname, '../client')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use(i18n.init);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

(async () => {
    try {
        await sequelize.sync({ force: false });
        logger.info('Database synchronized successfully');
    } catch (error) {
        logger.error('Database synchronization failed', { error: error.message });
    }
})();

const isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        logger.warn('Unauthorized admin access attempt', { user: req.session.user?.email });
        return res.redirect('/auth/login');
    }
    next();
};

const redirectByRole = (req, res, next) => {
    if (req.session.user) {
        switch (req.session.user.role) {
            case 'admin': return res.redirect('/admin/dashboard');
            case 'master': return res.redirect('/master/dashboard');
            case 'client': return res.redirect('/client/dashboard');
        }
    }
    next();
};

const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const threeDRoutes = require('./routes/threeDRoutes');
const adminRoutes = require('./routes/adminRoutes');
const masterRoutes = require('./routes/masterRoutes');
const clientRoutes = require('./routes/clientRoutes');

app.use('/auth', authRoutes);
app.use('/services', serviceRoutes);
app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);
app.use('/notifications', notificationRoutes);
app.use('/chat', chatRoutes);
app.use('/3d', threeDRoutes);
app.use('/admin', isAdmin, adminRoutes);
app.use('/master', masterRoutes);
app.use('/client', clientRoutes);

app.get('/auth/register', (req, res) => {
    logger.info('Accessed registration page');
    res.render('register', { error: null, lang: req.getLocale(), styles: getStyles(req) });
});
app.get('/auth/login', redirectByRole, (req, res) => {
    logger.info('Accessed login page');
    res.render('login', { error: null, lang: req.getLocale(), styles: getStyles(req) });
});
app.get('/services', async (req, res) => {
    const { Service } = require('./models');
    try {
        const services = await Service.findAll();
        logger.info('Services fetched successfully', { count: services.length });
        res.render('services', { services, lang: req.getLocale(), styles: await getStyles(req) });
    } catch (error) {
        logger.error('Error fetching services', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});
app.get('/', redirectByRole, async (req, res) => {
    const { Service } = require('./models');
    try {
        const services = await Service.findAll();
        logger.info('Homepage loaded', { serviceCount: services.length });
        res.render('index', { services, lang: req.getLocale(), styles: await getStyles(req) });
    } catch (error) {
        logger.error('Error fetching services for homepage', { error: error.message });
        res.status(500).send('Internal Server Error');
    }
});

app.use(async (req, res) => {
    logger.warn('404 Error', { path: req.path });
    res.status(404).render('404', { lang: req.getLocale(), styles: await getStyles(req) });
});

const PORT = parseInt(process.env.PORT) || 3000;
server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`, { timestamp: new Date().toISOString() });
}).on('error', (err) => {
    logger.error('Server error', { error: err.message });
    process.exit(1);
});

io.on('connection', (socket) => {
    logger.info('User connected', { socketId: socket.id });
    socket.on('chatMessage', async (msg) => {
        const { Chat } = require('./models');
        try {
            await Chat.create(msg);
            io.emit('chatMessage', msg);
            logger.info('Chat message sent', { message: msg.message });
        } catch (error) {
            logger.error('Error sending chat message', { error: error.message });
        }
    });
    socket.on('notification', (data) => {
        io.emit('notification', data);
        logger.info('Notification sent', { data });
    });
    socket.on('disconnect', () => {
        logger.info('User disconnected', { socketId: socket.id });
    });
});

async function getStyles(req) {
    const { Settings } = require('./models');
    try {
        const settings = await Settings.findOne();
        return {
            primary: settings?.primaryColor || '#4361ee',
            secondary: settings?.secondaryColor || '#3f37c9',
            background: settings?.backgroundColor || '#f0f2f5'
        };
    } catch (error) {
        logger.error('Error fetching styles', { error: error.message });
        return {
            primary: '#4361ee',
            secondary: '#3f37c9',
            background: '#f0f2f5'
        };
    }
}