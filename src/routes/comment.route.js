const { Router } = require('express');
const router = Router();
const { commentController } = require('../controllers');
const { commentMiddleware } = require('../middlewares');


router.get('/', commentController.getComments);
router.get('/:id', commentMiddleware.validObjectId, commentMiddleware.existsComment, commentController.getCommentById);
router.post('/', commentController.createComment);
router.put('/:id', commentMiddleware.validObjectId, commentMiddleware.existsComment, commentController.updateComment);
router.delete('/:id', commentMiddleware.validObjectId, commentMiddleware.existsComment, commentController.deleteComment);

module.exports = router;