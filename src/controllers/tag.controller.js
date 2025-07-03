const Tag = require('../db/models/tag');
const mongoose = require('mongoose');
const Post = require('../db/models/post'); // Asegurate de importar el modelo
const cache = require('../../utils/cache');


// Obtener todos los tags con solo ids de posts asociados
const getTags = async (req, res) => {
  try {
    const tags = await Tag.find();

    const tagsWithPostIds = tags.map(tag => ({
      ...tag.toJSON(),
      posts: tag.posts.map(postId => postId.toString())
    }));

    res.status(200).json(tagsWithPostIds);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las etiquetas' });
  }
};

// Obtener un tag por ID con sólo ids de posts asociados
const getTagById = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: 'Etiqueta no encontrada' });
    }

    const tagWithPostIds = {
      ...tag.toJSON(),
      posts: tag.posts.map(postId => postId.toString())
    };

    res.status(200).json(tagWithPostIds);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la etiqueta solicitada' });
  }
};

const createTag = async (req, res) => {
  try {
    const { name, postId } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre del tag es requerido' });
    }

    // 🔍 Buscar si el tag ya existe
    let tag = await Tag.findOne({ name: name.trim().toLowerCase() });

    if (tag) {
      // Si ya existe y se incluye postId, agregalo al array de posts si no está
      if (postId && !tag.posts.includes(postId)) {
        tag.posts.push(postId);
        await tag.save();
      }

      return res.status(200).json(tag); // Devolver el existente
    }

    // Crear nuevo tag si no existe
    tag = new Tag({ name: name.trim().toLowerCase(), posts: postId ? [postId] : [] });
    await tag.save();

    res.status(201).json(tag);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'El tag ya existe (violación de restricción única)' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Error al crear la etiqueta' });
    }
  }
};


const deleteTag = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: 'Etiqueta no encontrada' });
    }
    await tag.deleteOne();
    res.status(200).json({ message: `El tag con ID ${id} se ha borrado correctamente` });
  } catch {
    res.status(500).json({ message: 'No se puede borrar el tag solicitado' });
  }
};

const updateTag = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: 'Etiqueta no encontrada' });
    }
    Object.assign(tag, req.body);
    await tag.save();
    res.status(200).json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la etiqueta' });
  }
};

// Asignar un post a un tag
const assignTagToPost = async (req, res) => {
  const tagId = req.params.id;
  const { postId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(tagId) || !mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: 'ID de tag o post inválido' });
  }

  try {
    const tag = await Tag.findById(tagId);
    if (!tag) return res.status(404).json({ message: 'Etiqueta no encontrada' });

    // Agregar postId en el tag (si no existe)
    if (!tag.posts.includes(postId)) {
      tag.posts.push(postId);
      await tag.save();
    }

    // Agregar tagId en el post (si no existe)
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post no encontrado' });

    if (!post.tags.includes(tagId)) {
      post.tags.push(tagId);
      await post.save();
    }

    // 🧹 Limpiar caché del post
    cache.del(`post_${postId}`);

    res.status(200).json({ message: 'Relación entre post y tag asignada correctamente', tagId, postId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al asignar el post al tag' });
  }
};


// Remover un post de un tag
const removeTagFromPost = async (req, res) => {
  const tagId = req.params.id;
  const { postId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(tagId) || !mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: 'ID de tag o post inválido' });
  }

  try {
    const tag = await Tag.findById(tagId);
    if (!tag) return res.status(404).json({ message: 'Etiqueta no encontrada' });

    // 🔴 Remover el post del array `posts` del tag
    tag.posts = tag.posts.filter(id => id.toString() !== postId);
    await tag.save();

    // 🔴 Remover el tag del array `tags` del post
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post no encontrado' });

    post.tags = post.tags.filter(id => id.toString() !== tagId);
    await post.save();

    // 🧹 Limpiar caché del post si usás caché
    cache.del(`post_${postId}`);

    res.status(200).json({ message: 'Tag removido del post correctamente', tagId, postId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al remover el tag del post' });
  }
};





module.exports = { getTags, createTag, getTagById, deleteTag, updateTag, assignTagToPost, removeTagFromPost };