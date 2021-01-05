const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nekoSchema = new Schema({
  id_key: {
    type: String
  },
  url: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => {
      delete ret._id
      delete ret.__v
      delete ret.createdAt
      delete ret.updatedAt
    }
  }
})

Neko = mongoose.model('Neko', nekoSchema);

module.exports = Neko;
