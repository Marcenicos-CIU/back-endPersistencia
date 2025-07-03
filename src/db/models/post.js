const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },

  // Autor del post (relación con User)
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },

  // Relación con imágenes
  images: [{
    type: Schema.Types.ObjectId,
    ref: 'postImage'
  }],

  // Relación con comentarios
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'comment'
  }],

  // Relación muchos a muchos con tags
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'tag'
  }]
}, {
  timestamps: true // Registra createdAt y updatedAt automáticamente
});

// 🧼 Limpia el campo __v de la respuesta
postSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('post', postSchema);