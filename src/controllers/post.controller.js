const Post = require('../db/models/post');
const PostImage = require('../db/models/postImage');
const Comment = require('../db/models/comment');
const Tag = require('../db/models/tag');
const cache = require('../../utils/cache');
const mongoose = require('mongoose');

// Obtener todos los posts con IDs de comentarios y tags asociados
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    // Aquí hacemos populate de user y tags para traer nombre del usuario y de los tags
    const posts = await Post.find()
      .select('-__v')
      .populate('user', 'nickName')
      .populate('tags', 'name')   // <----- Aquí agregamos populate para traer los nombres de los tags
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Para cada post, buscamos los comentarios e imágenes
    const postsWithRelations = await Promise.all(
      posts.map(async (post) => {
        const commentIds = await Comment.find({ post: post._id }).select('_id');
        const images = await PostImage.find({ post: post._id }).select('_id url');

        return {
          ...post.toJSON(),
          comments: commentIds.map(c => c._id),
          images: images.map(img => ({ _id: img._id, url: img.url })),
          // tags ya vienen completos por populate (con _id y name)
        };
      })
    );

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      page,
      limit,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      posts: postsWithRelations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los posts' });
  }
};




const getPostById = async (req, res) => {
  const postId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  const cachedPost = cache.get(`post_${postId}`);
  if (cachedPost) {
    console.log('📦 Devolviendo post desde cache');
    return res.status(200).json(cachedPost);
  }

  try {
    const post = await Post.findById(postId)
      .populate('tags', 'name')       // traer nombre del tag
      .populate('user', 'nickName')   // traer nick del usuario
      .select('-__v');

    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    const commentIds = await Comment.find({ post: postId }).select('_id');
    const images = await PostImage.find({ post: postId }).select('_id url');

    const postWithRelations = {
      ...post.toJSON(),
      comments: commentIds.map(c => c._id),
      images: images.map(img => ({ _id: img._id, url: img.url })),
      // tags ya vienen con populate
    };

    cache.set(`post_${postId}`, postWithRelations);
    console.log('🛠️ Post obtenido desde la base de datos con relaciones (incluye imágenes y tags)');

    res.status(200).json(postWithRelations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el post' });
  }
};




// Crear nuevo post y subir imágenes asociadas
const createPost = async (req, res) => {
  try {
    let { description, user, tags = [] } = req.body;

    if (!description || !user) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: description o user' });
    }

    // 🔄 Si los tags vienen como string desde FormData, los parseamos
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch {
        tags = [];
      }
    }

    if (!Array.isArray(tags)) tags = [];

    // 🧼 Normalizar y eliminar duplicados
    tags = [...new Set(tags.map(tag => tag.trim().toLowerCase()))];

    // 📝 Crear el post sin imágenes ni tags aún
    const newPost = new Post({ description, user });
    await newPost.save();

    // 🖼️ Guardar imágenes si las hay
    if (req.files && req.files.length > 0) {
      const imagesToCreate = req.files.map(file => ({
        post: newPost._id,
        url: `/images/${file.filename}`
      }));

      const savedImages = await PostImage.insertMany(imagesToCreate);
      newPost.images = savedImages.map(img => img._id);
    }

    // 🏷️ Procesar tags
    const tagIds = [];

    for (const tagName of tags) {
      const existingTag = await Tag.findOne({ name: tagName });

      let tag;
      if (existingTag) {
        // Ya existe → asociamos el post si no está aún
        if (!existingTag.posts.includes(newPost._id)) {
          existingTag.posts.push(newPost._id);
          await existingTag.save();
        }
        tag = existingTag;
      } else {
        // No existe → lo creamos
        tag = new Tag({ name: tagName, posts: [newPost._id] });
        await tag.save();
      }

      tagIds.push(tag._id);
    }

    // 🔗 Asignar tags al post y guardar
    newPost.tags = tagIds;
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    console.error('Error al crear post:', err);
    res.status(500).json({ error: 'Error al crear el post' });
  }
};



// Eliminar post por ID
const deletePost = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const removed = await Post.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    cache.del(`post_${id}`);
    res.status(200).json({ message: `El posteo con ID ${removed._id} se ha borrado correctamente` });
  } catch {
    res.status(500).json({ message: 'Error al borrar el post' });
  }
};

// Actualizar post por ID
const updatePost = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  try {
    const post = await Post.findByIdAndUpdate(id, req.body, { new: true });
    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    cache.del(`post_${id}`);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el post' });
  }
};

module.exports = {
  getPosts,
  createPost,
  getPostById,
  deletePost,
  updatePost
};
