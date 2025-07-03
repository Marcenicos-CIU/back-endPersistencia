const { Router } = require('express');
const router = Router();
const { postController } = require('../controllers');
const { postMiddleware } = require('../middlewares');
const upload = require('../middlewares/uploadMiddleware'); // middleware para subir imágenes

router.get('/', postController.getPosts);
router.get('/:id', postMiddleware.validObjectId, postMiddleware.existsPost, postController.getPostById);


router.post('/', upload.array('images', 5), postController.createPost);

router.delete('/:id', postMiddleware.validObjectId, postMiddleware.existsPost, postController.deletePost);
router.put('/:id', postMiddleware.validObjectId, postMiddleware.existsPost, postController.updatePost);

module.exports = router;