const PostImage = require('../db/models/postImage');
const cache = require('../../utils/cache');
const mongoose = require('mongoose');

const getPostImages = async (req, res) => {
  try {
    const images = await PostImage.find({});
    res.status(200).json(images);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las imágenes' });
  }
};

const getPostImageById = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const image = await PostImage.findById(id);
    if (!image) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }

    const formattedImage = {
      ...image.toJSON(),
      post: image.post.toString() // ⚠️ aseguramos que sea string
    };

    res.status(200).json(formattedImage);
  } catch {
    res.status(500).json({ message: 'Error al obtener la imagen solicitada' });
  }
};


const createPostImage = async (req, res) => {
  try {
    const newImage = new PostImage(req.body);
    await newImage.save();
    cache.del(`post_${newImage.post}`); // Aquí 'post' es el campo ref al Post
    res.status(201).json(newImage);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear la imagen' });
  }
};

const deletePostImage = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const image = await PostImage.findById(id);
    if (!image) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }
    const postId = image.post;
    await image.deleteOne();
    cache.del(`post_${postId}`);
    res.status(200).json({ message: `La imagen con ID ${id} se ha borrado correctamente` });
  } catch {
    res.status(500).json({ message: 'No se encuentra la imagen solicitada' });
  }
};

const updatePostImage = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const image = await PostImage.findById(id);
    if (!image) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }
    const postId = image.post;

    Object.assign(image, req.body);
    await image.save();

    cache.del(`post_${postId}`);
    res.status(200).json(image);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la imagen del post' });
  }
};

const uploadImageForPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'ID de post inválido' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No se envió archivo' });
    }

    const newImage = new PostImage({
      post: postId,
      url: `/images/${req.file.filename}`
    });

    await newImage.save();

    res.status(201).json({ message: 'Imagen subida con éxito', image: newImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
};

module.exports = {
  getPostImages,
  getPostImageById,
  createPostImage,
  deletePostImage,
  updatePostImage,
  uploadImageForPost
};