const mongoose = require('mongoose');
const { Schema } = mongoose;

const tagSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },

  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'post'
  }]
}, {
  timestamps: false
});

// 🧼 Limpia el campo __v de la respuesta
tagSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('tag', tagSchema);