const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    groupName: { 
        type: String, 
        required: [true, 'חובה להזין שם קבוצה'],
        trim: true 
    },
    productDescription: { 
        type: String, 
        required: [true, 'חובה להזין תיאור מוצר'] 
    },
    customerCount: { 
        type: Number, 
        min: [1, 'מספר לקוחות חייב להיות לפחות 1'],
        default: 1
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: [true, 'חובה להזין מי פתח את הקבוצה'] 
    },
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    priceOffers: { 
        type: [{
            price: { type: Number, required: true },
            supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            createdAt: { type: Date, default: Date.now }
        }],
        default: [] 
    },
    lowestPrice: { 
        type: Number, 
        default: null 
    },
    status: { 
        type: String, 
        enum: ['Open', 'Closed'], 
        default: 'Open' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Group', groupSchema);