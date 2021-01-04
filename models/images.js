const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imagesSchema = new Schema({
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

Images = mongoose.model('Images', imagesSchema);

module.exports = Images;
