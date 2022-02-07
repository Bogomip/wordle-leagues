const mongoose = require('mongoose');
const User = require('./user');
const uniqueValidator = require('mongoose-unique-validator');

const resultSchema = mongoose.Schema({
  wordleId: { type: Number, required: true, unique: true },
  score: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

resultSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Result', resultSchema);
