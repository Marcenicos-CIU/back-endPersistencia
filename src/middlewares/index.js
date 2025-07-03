const generic = require("./generic.middleware");
const userMiddleware = require("./user.middleware");
const postMiddleware = require("./post.middleware");
const tagMiddleware = require("./tag.middleware");
const commentMiddleware = require("./comment.middleware");


module.exports = {generic, userMiddleware, postMiddleware, tagMiddleware, commentMiddleware}