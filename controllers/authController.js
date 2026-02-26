const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res, next) => {
    try {
        const { fullName, email, phone, password, role } = req.body;
        const user = new User({ fullName, email, phone, password, role });
        await user.save();
        res.status(201).json({ message: 'משתמש נרשם בהצלחה' });
    } catch (error) {
        error.status = 400;
        error.message = 'שגיאה בהרשמה: ' + error.message;
        return next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            const error = new Error('דוא"ל או סיסמה שגויים');
            error.status = 401;
            return next(error);
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        error.status = 500;
        error.message = 'שגיאת שרת';
        return next(error);
    }
};