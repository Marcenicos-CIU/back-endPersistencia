const mongoose = require('mongoose');
const Tag = require('../db/models/tag'); // Ajusta la ruta según donde tengas el modelo mongoose

const validObjectId = (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  next();
};

const existsTag = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: `No existe el tag con id ${req.params.id}` });
    }
    req.tag = tag; // opcional, para pasar el tag al controlador
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar el tag' });
  }
};

module.exports = { validObjectId, existsTag };