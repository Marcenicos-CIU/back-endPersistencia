const mongoose = require('mongoose');
const Comment = require('../db/models/comment');

const validObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  next();
};

const existsComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }
    // Lo guardamos en req para que el controller pueda usarlo si quiere
    req.comment = comment;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error en la verificación del comentario' });
  }
};

module.exports = { validObjectId, existsComment };