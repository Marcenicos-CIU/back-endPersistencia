const mongoose = require('mongoose');
const User = require('../db/models/user'); // Ajustá la ruta a tu modelo mongoose

const validObjectId = (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }
  next();
};

const existsUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: `No existe el usuario con id ${req.params.id}` });
    }
    req.user = user; // opcional, para usar el user en controlador
    next();
  } catch (error) {
    res.status(500).json({ message: "Error al buscar el usuario" });
  }
};

module.exports = { validObjectId, existsUser };