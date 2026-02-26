const Group = require('../models/Group');

const checkGroupExists = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).render('error', { message: 'הקבוצה לא נמצאה במערכת' });
        }
        req.group = group; 
        next();
    } catch (error) {
        res.status(500).render('error', { message: 'שגיאה בבדיקת קיום הקבוצה' });
    }
};

module.exports = checkGroupExists;