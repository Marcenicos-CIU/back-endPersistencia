const mongoose = require('mongoose');
const Post = require('../db/models/post'); // asumí que tu modelo mongoose está aquí

const validObjectId = (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  next();
};

const existsPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: `No existe el post con id ${req.params.id}` });
    }
    req.post = post; // si querés pasar el post al controlador
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar el post' });
  }
};

module.exports = { validObjectId, existsPost };