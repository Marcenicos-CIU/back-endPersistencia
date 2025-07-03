const User = require('../db/models/user');
const Post = require('../db/models/post');
const Comment = require('../db/models/comment');
const mongoose = require('mongoose');

// 🔍 Devuelve todos los usuarios con posts y comentarios (solo _id)
const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    const usersWithPostsAndComments = await Promise.all(
      users.map(async (user) => {
        const posts = await Post.find({ user: user._id }).select('_id');
        const comments = await Comment.find({ user: user._id }).select('_id');

        return {
          ...user.toJSON(),
          posts: posts.map(p => p._id),
          comments: comments.map(c => c._id),
        };
      })
    );

    res.status(200).json(usersWithPostsAndComments);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener usuarios' });
  }
};

// 🔍 Devuelve un usuario por ID con posts y comentarios (solo _id)
const getUserById = async (req, res) => {
  const _id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const posts = await Post.find({ user: _id }).select('_id');
    const comments = await Comment.find({ user: _id }).select('_id');

    const userWithPostsAndComments = {
      ...user.toJSON(),
      posts: posts.map(p => p._id),
      comments: comments.map(c => c._id),
    };

    res.status(200).json(userWithPostsAndComments);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'No se pudo obtener el usuario solicitado' });
  }
};

// ✅ Crea un nuevo usuario
const createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al crear el usuario' });
  }
};

// ❌ Elimina un usuario por ID
const deleteUser = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.deleteOne();
    res.status(200).json({ message: `El usuario con ID ${id} se ha borrado correctamente` });
  } catch (error) {
    res.status(500).json({ message: 'No se puede borrar el usuario solicitado' });
  }
};

// ✏️ Actualiza un usuario
const updateUser = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    Object.assign(user, req.body);
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

// 🤝 Seguir a otro usuario
const followUser = async (req, res) => {
  const { id } = req.params;
  const { targetId } = req.body;

  // Validar IDs
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  if (id === targetId) {
    return res.status(400).json({ message: 'No puedes seguirte a ti mismo' });
  }

  try {
    const user = await User.findById(id);
    const target = await User.findById(targetId);

    if (!user || !target) {
      return res.status(404).json({ message: 'Usuario o seguido no encontrado' });
    }

    // Evitar duplicados
    if (!user.following.includes(targetId)) {
      user.following.push(targetId);
    }

    if (!target.followers.includes(id)) {
      target.followers.push(id);
    }

    await user.save();
    await target.save();

    res.status(200).json({ message: `${user.nickName} ahora sigue a ${target.nickName}` });
  } catch (error) {
    console.error('Error al seguir usuario:', error);
    res.status(500).json({ error: 'Error al intentar seguir al usuario' });
  }
};

// 🚫 Dejar de seguir a un usuario
const unfollowUser = async (req, res) => {
  const { id } = req.params;
  const { targetId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  if (id === targetId) {
    return res.status(400).json({ message: 'No puedes dejar de seguirte a ti mismo' });
  }

  try {
    const user = await User.findById(id);
    const target = await User.findById(targetId);

    if (!user || !target) {
      return res.status(404).json({ message: 'Usuario o seguido no encontrado' });
    }

    // Eliminar de following y followers si existen
    user.following = user.following.filter(f => f.toString() !== targetId);
    target.followers = target.followers.filter(f => f.toString() !== id);

    await user.save();
    await target.save();

    res.status(200).json({ message: `${user.nickName} ha dejado de seguir a ${target.nickName}` });
  } catch (error) {
    console.error('Error al dejar de seguir usuario:', error);
    res.status(500).json({ error: 'Error al intentar dejar de seguir al usuario' });
  }
};


module.exports = {
  getUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
  followUser,
  unfollowUser
};
