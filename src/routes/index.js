//archivo que recolecta todas las rutas 

const tagRoute = require('./tag.route');
const userRoute = require('./user.route');
const postRoute = require('./post.route');
const postImageRoute = require('./postImage.route');
const commentRoute = require('./comment.route');


module.exports = { tagRoute, userRoute, postRoute, postImageRoute, commentRoute };