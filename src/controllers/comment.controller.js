require('dotenv').config();
const Comment = require('../db/models/comment'); // modelo mongoose
const mongoose = require('mongoose');

// Obtener todos los comentarios visibles (menos de X meses de antigüedad)
const getComments = async (req, res) => {
  try {
    const monthsLimit = parseInt(process.env.COMMENT_VISIBLE_MONTHS || '5');
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsLimit);

    const comments = await Comment.find({
      createdAt: { $gte: cutoffDate }
    }).populate('user', 'nickName');  // <- Acá está el populate

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los comentarios' });
  }
};


// Crear nuevo comentario
const createComment = async (req, res) => {
  try {
    const { text, post, user } = req.body;

    // Validar que los ObjectId sean válidos
    if (!mongoose.Types.ObjectId.isValid(post) || !mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ error: 'post o user ID inválidos' });
    }

    const newComment = new Comment({
      text,
      post,
      user
    });

    await newComment.save();

    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear el comentario' });
  }
};

// Obtener un comentario por ID
const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el comentario' });
  }
};

// Eliminar comentario
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const removed = await Comment.findByIdAndDelete(id);

    if (!removed) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    res.status(200).json({ message: `El comentario con ID ${removed._id} se ha borrado correctamente` });
  } catch (error) {
    res.status(500).json({ error: 'No se encuentra el comentario solicitado' });
  }
};

// Actualizar comentario
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    comment.text = text;
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el comentario' });
  }
};

module.exports = {
  getComments,
  createComment,
  getCommentById,
  updateComment,
  deleteComment
};