const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const checkGroupExists = require('../middleware/checkExistence');

const auth = require('../middleware/authMiddleware');

router.get('/', auth, groupController.getAllGroups);
router.post('/', auth, groupController.createGroup);

router.get('/:id', auth, groupController.getGroupById);
router.put('/:id', auth, checkGroupExists, groupController.updateGroup);
router.delete('/:id', auth, checkGroupExists, groupController.deleteGroup);

router.post('/:id/join', auth, groupController.joinGroup);
router.post('/:id/offer', auth, groupController.submitPriceOffer);
router.delete('/:groupId/offer/:offerId', auth, groupController.deletePriceOffer);

module.exports = router;

