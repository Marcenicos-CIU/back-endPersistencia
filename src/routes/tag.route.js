const { Router } = require('express');
const router = Router();
const { tagController } = require('../controllers');
const { tagMiddleware } = require('../middlewares');

router.get('/', tagController.getTags);
router.get('/:id', tagMiddleware.validObjectId, tagMiddleware.existsTag, tagController.getTagById);
router.post('/', tagController.createTag);
router.delete('/:id', tagMiddleware.validObjectId, tagMiddleware.existsTag, tagController.deleteTag);
router.put('/:id', tagMiddleware.validObjectId, tagMiddleware.existsTag, tagController.updateTag);

router.put('/:id/assign', tagController.assignTagToPost);
router.put('/:id/remove', tagController.removeTagFromPost);

module.exports = router;