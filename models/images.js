const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imagesSchema = new Schema({
  id: {
    type: Number
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
    }
  }
})

Images = mongoose.model('Images', imagesSchema);

module.exports = Images;
