const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  nickName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },


  // Seguidores (quienes lo siguen)
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'user'
  }],

  // A quiénes sigue
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'user'
  }]
}, {
  timestamps: false
});

// 🧼 Limpia el campo __v de la respuesta
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});



module.exports = mongoose.model('user', userSchema);