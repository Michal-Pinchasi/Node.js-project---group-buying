const Group = require('../models/Group');

exports.getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find().populate('createdBy', 'fullName email').populate('members', 'fullName email'); 
        res.render('groups', { groups });
    } catch (error) {
        error.status = 500;
        error.message = error.message || 'שגיאה בשליפת הקבוצות';
        return next(error);
    }
};


exports.getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('createdBy', 'fullName email')
            .populate('members', 'fullName email');
        res.render('groupDetail', { group, user: req.user });
    } catch (error) {
        error.status = 500;
        error.message = error.message || 'שגיאה בשליפת פרטי הקבוצה';
        return next(error);
    }
};


exports.createGroup = async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            const error = new Error('גישה נדחתה: רק לקוחות יכולים ליצור קבוצות');
            error.status = 403;
            return next(error);
        }
        
        const { groupName, productDescription, customerCount } = req.body;
        const initialCount = customerCount ? Number(customerCount) : 1;
        const newGroup = new Group({ 
            groupName, 
            productDescription, 
            customerCount: initialCount,
            createdBy: req.user.id,
            members: [req.user.id]
        });
        await newGroup.save();
        res.redirect('/groups');
    } catch (error) {
        error.status = 400;
        error.message = 'נתונים לא תקינים: ' + error.message;
        return next(error);
    }
};

exports.joinGroup = async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            const error = new Error('גישה נדחתה: רק לקוחות יכולים להצטרף לקבוצות');
            error.status = 403;
            return next(error);
        }

        const group = await Group.findById(req.params.id);
        
        if (!group) {
            const error = new Error('הקבוצה לא נמצאה');
            error.status = 404;
            return next(error);
        }

        if (group.members.includes(req.user.id)) {
            const error = new Error('אתה כבר חבר בקבוצה זו');
            error.status = 400;
            return next(error);
        }

        group.members.push(req.user.id);
        group.customerCount = group.members.length;
        await group.save();
        res.redirect(`/groups/${req.params.id}`);
    } catch (error) {
        error.status = 500;
        error.message = 'שגיאה בהצטרפות לקבוצה: ' + error.message;
        return next(error);
    }
};

exports.submitPriceOffer = async (req, res) => {
    try {
        if (req.user.role !== 'supplier') {
            const error = new Error('גישה נדחתה: רק יבואנים יכולים להציע מחירים');
            error.status = 403;
            return next(error);
        }

        const { price } = req.body;
        
        if (!price || price <= 0) {
            const error = new Error('מחיר חייב להיות גדול מ-0');
            error.status = 400;
            return next(error);
        }

        const group = await Group.findById(req.params.id);
        
        if (!group) {
            const error = new Error('הקבוצה לא נמצאה');
            error.status = 404;
            return next(error);
        }

        if (group.status === 'Closed') {
            const error = new Error('לא ניתן להציע מחיר לקבוצה סגורה');
            error.status = 400;
            return next(error);
        }

        group.priceOffers.push({
            price: parseFloat(price),
            supplierId: req.user.id
        });
        
        const prices = group.priceOffers.map(offer => offer.price);
        group.lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
        
        await group.save();
        
        res.redirect(`/groups/${req.params.id}`);
    } catch (error) {
        error.status = 500;
        error.message = 'שגיאה בהגשת הצעת מחיר: ' + error.message;
        return next(error);
    }
};

exports.deletePriceOffer = async (req, res) => {
    try {
        if (req.user.role !== 'supplier') {
            const error = new Error('גישה נדחתה: רק יבואנים יכולים למחוק הצעות');
            error.status = 403;
            return next(error);
        }

        const { groupId, offerId } = req.params;
        
        const group = await Group.findById(groupId);
        
        if (!group) {
            const error = new Error('הקבוצה לא נמצאה');
            error.status = 404;
            return next(error);
        }

        const offerIndex = group.priceOffers.findIndex(offer => offer._id.toString() === offerId);
        
        if (offerIndex === -1) {
            const error = new Error('הצעת המחיר לא נמצאה');
            error.status = 404;
            return next(error);
        }

        if (group.priceOffers[offerIndex].supplierId.toString() !== req.user.id) {
            const error = new Error('גישה נדחתה: רק בעל ההצעה יכול למחוק אותה');
            error.status = 403;
            return next(error);
        }

        group.priceOffers.splice(offerIndex, 1);
        
        const prices = group.priceOffers.map(offer => offer.price);
        group.lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
        
        await group.save();
        
        res.redirect(`/groups/${groupId}`);
    } catch (error) {
        error.status = 500;
        error.message = 'שגיאה במחיקת הצעת המחיר: ' + error.message;
        return next(error);
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        
        if (!group) {
            return res.status(404).render('error', { message: 'הקבוצה לא נמצאה' });
        }

        if (group.createdBy.toString() !== req.user.id) {
            return res.status(403).render('error', { message: 'גישה נדחתה: רק יוצר הקבוצה יכול למחוק אותה' });
        }

        await Group.findByIdAndDelete(req.params.id);
        res.redirect('/groups');
    } catch (error) {
        res.status(500).render('error', { message: 'שגיאה במחיקה' });
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const { status, groupName, productDescription, customerCount } = req.body;
        const group = await Group.findById(req.params.id);
        
        if (!group) {
            return res.status(404).render('error', { message: 'הקבוצה לא נמצאה לעדכון' });
        }

        if (group.createdBy.toString() !== req.user.id) {
            return res.status(403).render('error', { message: 'גישה נדחתה: רק יוצר הקבוצה יכול לעדכן אותה' });
        }

        const updatedGroup = await Group.findByIdAndUpdate(
            req.params.id, 
            { 
                status, 
                groupName, 
                productDescription, 
                customerCount 
            }, 
            { new: true, runValidators: true }
        );

        res.redirect('/groups');
    } catch (error) {
        res.status(400).render('error', { message: 'שגיאה בעדכון הקבוצה: ' + error.message });
    }
};
